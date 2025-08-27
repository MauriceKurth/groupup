<?php

namespace App\Controller;

use App\Entity\Team;
use App\Entity\Membership;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\User\UserInterface;

#[Route('/api/custom', name: 'api_custom_')]
class ApiController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {}

    /**
     * Rejoindre une team avec un code d'invitation
     */
    #[Route('/join-team', name: 'join_team', methods: ['POST'])]
    public function joinTeam(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        // Validation basique
        if (!isset($data['inviteCode']) || !isset($data['userId'])) {
            return $this->json([
                'error' => 'inviteCode et userId sont requis'
            ], Response::HTTP_BAD_REQUEST);
        }
        
        // Trouver la team par son code
        $team = $this->entityManager->getRepository(Team::class)
            ->findOneBy(['inviteCode' => $data['inviteCode']]);
        
        if (!$team) {
            return $this->json([
                'error' => 'Code d\'invitation invalide'
            ], Response::HTTP_NOT_FOUND);
        }
        
        // Trouver l'utilisateur
        $user = $this->entityManager->getRepository(User::class)
            ->find($data['userId']);
        
        if (!$user) {
            return $this->json([
                'error' => 'Utilisateur non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }
        
        // Vérifier si déjà membre
        $existingMembership = $this->entityManager->getRepository(Membership::class)
            ->findOneBy([
                'member' => $user,
                'team' => $team
            ]);
        
        if ($existingMembership) {
            return $this->json([
                'error' => 'Déjà membre de cette équipe'
            ], Response::HTTP_CONFLICT);
        }
        
        // Créer le membership
        $membership = new Membership();
        $membership->setMember($user);
        $membership->setTeam($team);
        $membership->setRole('member'); // Nouveau membre = role basique
        $membership->setJoinedAt(new \DateTimeImmutable());
        
        $this->entityManager->persist($membership);
        $this->entityManager->flush();
        
        return $this->json([
            'message' => 'Vous avez rejoint l\'équipe avec succès',
            'team' => [
                'id' => $team->getId(),
                'name' => $team->getName()
            ]
        ], Response::HTTP_CREATED);
    }
    
    /**
     * Obtenir les stats d'un événement
     */
    #[Route('/event/{id}/stats', name: 'event_stats', methods: ['GET'])]
    public function eventStats(int $id): JsonResponse
    {
        $event = $this->entityManager->getRepository(\App\Entity\Event::class)->find($id);
        
        if (!$event) {
            return $this->json(['error' => 'Event not found'], Response::HTTP_NOT_FOUND);
        }
        
        $participations = $event->getParticipations();
        
        $stats = [
            'present' => 0,
            'absent' => 0,
            'maybe' => 0,
            'no_response' => 0
        ];
        
        foreach ($participations as $participation) {
            $status = $participation->getStatus();
            if (isset($stats[$status])) {
                $stats[$status]++;
            }
        }
        
        // Calculer les non-réponses
        $teamMembersCount = $event->getTeam()->getMemberships()->count();
        $stats['no_response'] = $teamMembersCount - count($participations);
        
        return $this->json([
            'event' => [
                'id' => $event->getId(),
                'title' => $event->getTitle(),
                'date' => $event->getProposedDate()->format('Y-m-d H:i:s')
            ],
            'stats' => $stats,
            'total_members' => $teamMembersCount
        ]);
    }
}