Introduction
L'objectif était de déployer mon API "Todo" de manière propre sur une machine Linux (WSL), en passant d'un lancement manuel à un service automatisé et sécurisé derrière un proxy Nginx.  

Ce que j'ai mis en place
Environnement : Setup de Node.js v20 et isolation de l'application dans /opt/todo-api.  

Sécurité : Création d'un utilisateur système todoapp sans privilèges root pour faire tourner le code.  

Base de données : Initialisation de SQLite dans un dossier dédié /var/lib/todo-api avec les bonnes permissions.  

Automatisation : Création d'un service systemd pour que l'API survive aux redémarrages.  

Accès : Configuration de Nginx en Reverse Proxy pour servir l'app sur le port 80.  

Mes galères (et comment je m'en suis sorti)
Franchement, tout ne s'est pas passé comme prévu :

Les faute de frappe fatale : J'ai passé un moment à me demander pourquoi mes dossiers n'existaient pas, avant de réaliser que j'avais créé /apt/todo-api au lieu de /opt/todo-api  

Les poupées russes : Mon git clone m'a créé un dossier dans un dossier (/opt/todo-api/todo-api). Résultat : Node ne trouvait plus rien. J'ai dû faire un grand ménage avec mv et rm -rf pour tout remettre à plat à la racine.  

Le cache-cache du fichier d'init : Je cherchais db-init.js alors que dans mon projet il s'appelait juste init.js. Une fois le bon nom trouvé, la base s'est enfin créée.  

Petit Guide de survie (Runbook)
Si l'app tombe ou si je dois la mettre à jour :

Relance propre : sudo systemctl restart todo-api.  

Logs : sudo journalctl -u todo-api -f pour voir les erreurs en direct.  

Check Nginx : sudo nginx -t pour vérifier que je n'ai pas cassé la config du proxy.
