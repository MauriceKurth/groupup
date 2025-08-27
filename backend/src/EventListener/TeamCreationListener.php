<?php

namespace App\EventListener;

use App\Entity\Team;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsDoctrineListener;
use Doctrine\ORM\Event\PrePersistEventArgs;
use Doctrine\ORM\Events;
use Symfony\Bundle\SecurityBundle\Security;

#[AsDoctrineListener(event: Events::prePersist)]
class TeamCreationListener
{
    public function __construct(
        private Security $security
    ) {}

    public function prePersist(PrePersistEventArgs $args): void
    {
        $entity = $args->getObject();

        // Debug 1 : Est-ce que le listener s'exécute ?
      //error_log("=== TeamCreationListener déclenché ===");
      //error_log("Type d'entité: " . get_class($entity));

        // On vérifie qu'on est bien sur une Team
        if (!$entity instanceof Team) {
          //error_log("Ce n'est pas une Team, on sort");
            return;
        }

        // Si la team a déjà un creator, on ne fait rien
        if ($entity->getCreator() !== null) {
           //rror_log("Team a déjà un creator, on sort");
            return;
        }

        // Debug 2 : Récupération de l'utilisateur
        /** @var User $user */
        $user = $this->security->getUser();
        
      //error_log("Utilisateur trouvé: " . ($user ? $user->getEmail() : "NULL"));
        
        if (!$user) {
           //rror_log("Aucun utilisateur connecté trouvé !");
            return;
        }

        // On assigne automatiquement le creator
        $entity->setCreator($user);
      //error_log("Creator assigné avec succès: " . $user->getEmail());
    }
}