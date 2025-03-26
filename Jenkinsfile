pipeline {
    agent any
    
    stages {
        
        stage('Packaging') {
            steps {
                sh 'docker build --pull --rm -f Dockerfile -t aichat:latest .'
            }
        }

        stage('Push to DockerHub') {
            steps {
                withDockerRegistry(credentialsId: 'dockerhub', url: 'https://index.docker.io/v1/') {
                    sh 'docker tag aichat:latest tuanhuu3264/aichat:latest'
                    sh 'docker push tuanhuu3264/aichat:latest'
                }
            }
        }

        stage('Deploy FE to DEV') {
            steps {
                sh '''
                    if [ $(docker ps -q -f name=aichat) ]; then
                        docker container stop aichat
                    fi
                    echo y | docker system prune
                    docker container run -d --name aichat -p 3000:3000 tuanhuu3264/aichat:latest
                '''
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
