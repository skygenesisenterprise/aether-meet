# Aether Meet - Configuration de développement local

## Instructions pour configurer une URL personnalisée

### 1. Modifier le fichier hosts (Windows/Linux/Mac)

#### Windows :
1. Ouvrez le Bloc-notes en tant qu'administrateur
2. Ouvrez le fichier : `C:\Windows\System32\drivers\etc\hosts`
3. Ajoutez cette ligne à la fin du fichier :
```
127.0.0.1   aether-meet.local
```

#### Linux/Mac :
1. Ouvrez un terminal
2. Éditez le fichier hosts avec sudo :
```bash
sudo nano /etc/hosts
```
3. Ajoutez cette ligne à la fin du fichier :
```
127.0.0.1   aether-meet.local
```

### 2. Démarrer le serveur de développement

```bash
npm run dev
# ou
pnpm dev
# ou
yarn dev
```

### 3. Accéder à l'application

Ouvrez votre navigateur et accédez à :
```
http://aether-meet.local:3000
```

Au lieu de :
```
http://localhost:3000
```

### 4. Configuration avancée (optionnel)

Pour un environnement de production, vous pouvez configurer :

#### Configuration DNS :
- Achetez un nom de domaine (ex: aether-meet.com)
- Configurez les enregistrements DNS pour pointer vers votre serveur

#### Configuration HTTPS :
- Utilisez des certificats SSL (Let's Encrypt recommandé)
- Mettez à jour la configuration Next.js pour HTTPS

#### Configuration du proxy :
```nginx
server {
    listen 80;
    server_name aether-meet.com www.aether-meet.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. Avantages de cette configuration

- **URL professionnelle** : `aether-meet.local` au lieu de `localhost:3000`
- **Environnement réaliste** : Simule un environnement de production
- **Facile à mémoriser** : Plus simple que localhost:3000
- **Configuration de test** : Idéal pour tester les fonctionnalités de domaine

### 6. Dépannage

Si l'URL ne fonctionne pas :
1. Vérifiez que le fichier hosts a été correctement modifié
2. Redémarrez votre navigateur
3. Videz le cache DNS :
   - Windows : `ipconfig /flushdns`
   - Linux/Mac : `sudo dscacheutil -flushcache`
4. Vérifiez que le serveur Next.js fonctionne bien

### 7. Pour revenir à localhost

Supprimez simplement la ligne ajoutée dans votre fichier hosts :
```
# 127.0.0.1   aether-meet.local
```

Et utilisez à nouveau `http://localhost:3000`