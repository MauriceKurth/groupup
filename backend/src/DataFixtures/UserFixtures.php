<?php

namespace App\DataFixtures;

use App\Entity\User;
use App\Entity\Team;
use App\Entity\Event;
use App\Entity\Membership;
use App\Entity\Participation;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Faker\Factory;

class UserFixtures extends Fixture
{
    private UserPasswordHasherInterface $passwordHasher;
    
    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    public function load(ObjectManager $manager): void
    {
        $faker = Factory::create('fr_FR'); // Données en français
        
        // Création de 5 utilisateurs de test
        $users = [];
        
        // Un utilisateur de test facile à retenir
        $mainUser = new User();
        $mainUser->setEmail('test@groupup.fr');
        $mainUser->setFirstName('Jean');
        $mainUser->setLastName('Dupont');
        $mainUser->setCreatedAt(new \DateTimeImmutable());
        $mainUser->setPassword(
            $this->passwordHasher->hashPassword($mainUser, 'password123')
        );
        $manager->persist($mainUser);
        $users[] = $mainUser;
        
        // 4 autres utilisateurs aléatoires
        for ($i = 0; $i < 4; $i++) {
            $user = new User();
            $user->setEmail($faker->email());
            $user->setFirstName($faker->firstName());
            $user->setLastName($faker->lastName());
            $user->setCreatedAt(new \DateTimeImmutable());
            $user->setPassword(
                $this->passwordHasher->hashPassword($user, 'password123')
            );
            $manager->persist($user);
            $users[] = $user;
        }
        
        // Création de 3 teams
        $teams = [];
        $teamNames = [
            'Weekend entre amis',
            'Sorties Strasbourg',
            'Team Building Entreprise'
        ];
        
        foreach ($teamNames as $index => $teamName) {
            $team = new Team();
            $team->setName($teamName);
            $team->setDescription($faker->paragraph());
            $team->setInviteCode(strtoupper($faker->lexify('??????'))); // Code de 6 lettres
            $team->setCreatedAt(new \DateTimeImmutable());
            $team->setCreator($users[$index]); // Les 3 premiers users créent chacun une team
            
            $manager->persist($team);
            $teams[] = $team;
            
            // Ajouter le créateur comme admin du groupe
            $membership = new Membership();
            $membership->setMember($users[$index]);
            $membership->setTeam($team);
            $membership->setRole('admin');
            $membership->setJoinedAt(new \DateTimeImmutable());
            $manager->persist($membership);
            
            // Ajouter 2-3 autres membres au hasard
            $otherUsers = [];
            foreach ($users as $u) {
                if ($u !== $users[$index]) {
                    $otherUsers[] = $u;
                }
            }
            shuffle($otherUsers);
            
            $maxMembers = min(rand(2, 3), count($otherUsers));
            for ($j = 0; $j < $maxMembers; $j++) {
                $membership = new Membership();
                $membership->setMember($otherUsers[$j]);
                $membership->setTeam($team);
                $membership->setRole($j === 0 ? 'moderator' : 'member');
                $membership->setJoinedAt(new \DateTimeImmutable());
                $manager->persist($membership);
            }
        }
        
        // Création d'événements pour chaque team
        $eventTitles = [
            'Barbecue dimanche',
            'Soirée jeux de société',
            'Restaurant italien',
            'Randonnée Vosges',
            'Cinéma Marvel'
        ];
        
        foreach ($teams as $team) {
            // 2-3 événements par team
            for ($i = 0; $i < rand(2, 3); $i++) {
                $event = new Event();
                $event->setTitle($faker->randomElement($eventTitles));
                $event->setDescription($faker->paragraph());
                $event->setProposedDate($faker->dateTimeBetween('+1 week', '+2 months'));
                $event->setLocation($faker->city());
                $event->setCreatedAt(new \DateTimeImmutable());
                $event->setTeam($team);
                $event->setCreatedBy($faker->randomElement($users));
                
                $manager->persist($event);
                
                // Ajouter des participations
                $teamMembers = $team->getMemberships();
                foreach ($teamMembers as $membership) {
                    if (rand(0, 100) > 30) { // 70% de chance de répondre
                        $participation = new Participation();
                        $participation->setParticipant($membership->getMember());
                        $participation->setEvent($event);
                        $participation->setStatus($faker->randomElement(['present', 'absent', 'maybe']));
                        $participation->setRespondedAt(new \DateTimeImmutable());
                        $manager->persist($participation);
                    }
                }
            }
        }
        
        $manager->flush();
        
        echo "\n✅ Fixtures créées avec succès !\n";
        echo "📧 Utilisateur de test : test@groupup.fr / password123\n";
        echo "👥 " . count($users) . " utilisateurs créés\n";
        echo "🏢 " . count($teams) . " teams créées\n";
    }
}