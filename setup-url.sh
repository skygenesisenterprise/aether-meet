#!/bin/bash

# Aether Meet - Script de configuration d'URL personnalisée

echo "🚀 Configuration d'Aether Meet avec URL personnalisée"
echo "=================================================="

# Vérifier si nous sommes sur macOS ou Linux
if [[ "$OSTYPE" == "darwin"* ]] || [[ "$OSTYPE" == "linux-gnu"* ]]; then
    HOSTS_FILE="/etc/hosts"
    echo "📍 Détection du système : macOS/Linux"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
    HOSTS_FILE="/c/Windows/System32/drivers/etc/hosts"
    echo "📍 Détection du système : Windows"
else
    echo "❌ Système non supporté pour la configuration automatique"
    echo "Veuillez suivre les instructions manuelles dans DEV_SETUP.md"
    exit 1
fi

echo "📁 Fichier hosts détecté : $HOSTS_FILE"

# Vérifier si aether-meet.local est déjà configuré
if grep -q "aether-meet.local" "$HOSTS_FILE"; then
    echo "✅ aether-meet.local est déjà configuré dans votre fichier hosts"
    echo ""
    echo "🌐 Accédez à l'application via : http://aether-meet.local:3000"
else
    echo "📝 Ajout de aether-meet.local au fichier hosts..."
    
    # Sauvegarde du fichier hosts original
    sudo cp "$HOSTS_FILE" "$HOSTS_FILE.backup"
    echo "💾 Sauvegarde créée : $HOSTS_FILE.backup"
    
    # Ajout de l'entrée au fichier hosts
    echo "127.0.0.1   aether-meet.local" | sudo tee -a "$HOSTS_FILE" > /dev/null
    echo "✅ Entrée ajoutée avec succès"
    
    echo ""
    echo "🔄 Redémarrage du service DNS (si nécessaire)..."
    
    # Redémarrage du service DNS selon le système
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sudo dscacheutil -flushcache
        echo "✅ Cache DNS macOS vidé"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo systemctl restart systemd-resolved 2>/dev/null || sudo service network-manager restart 2>/dev/null || echo "⚠️  Redémarrage manuel du service DNS peut être nécessaire"
        echo "✅ Service DNS redémarré"
    fi
fi

echo ""
echo "🎯 Étapes suivantes :"
echo "1. Démarrez le serveur de développement :"
echo "   npm run dev"
echo "   ou"
echo "   pnpm dev"
echo ""
echo "2. Ouvrez votre navigateur et accédez à :"
echo "   🌐 http://aether-meet.local:3000"
echo ""
echo "3. Profitez de votre URL personnalisée ! 🎉"
echo ""
echo "📚 Pour revenir à localhost, supprimez la ligne '127.0.0.1   aether-meet.local' de votre fichier hosts"
echo "   ou utilisez le fichier de sauvegarde : sudo cp $HOSTS_FILE.backup $HOSTS_FILE"