pipeline{
    agent any
    environment{
        DEPLOY_USER = 'ubuntu'
        DEPLOY_HOST = 'scanpie.sambhav.click'
        APP_DIR = '/home/ubuntu/Shuddhi'
    }
    stages{
        stage("Checkout"){
            steps {
                checkout([$class: 'GitSCM', branches: [[name: '*/main']], userRemoteConfigs: [[url: 'https://github.com/Sharma-Sambhav/Shuddhi.git']]])
            }
        }
        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        stage('Deploy') {
                steps {
                    sshagent(['deploy-key']) {
                    sh "ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} 'cd ${APP_DIR} && git pull origin main && npm ci && npm run build && pm2 restart Shuddhi'"
                    }
                 }
        }

    }
}
