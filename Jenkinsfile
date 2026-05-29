pipeline {
  agent any

  environment {
    COMPOSE_FILES = "--env-file config/prod.env -f docker-compose.yml -f docker-compose.prod.yml"
    PROJECT_DIR   = "/workspace"
  }

  stages {
    stage('Pull Latest Code') {
      steps {
        dir("${PROJECT_DIR}") {
          sh 'git checkout main'
          sh 'git pull origin main'
        }
      }
    }

    stage('Build Images') {
      steps {
        dir("${PROJECT_DIR}") {
          sh "docker compose ${COMPOSE_FILES} build --parallel"
        }
      }
    }

    stage('Deploy') {
      steps {
        dir("${PROJECT_DIR}") {
          sh "docker compose ${COMPOSE_FILES} up -d"
        }
      }
    }

    stage('Run DB Migration') {
      steps {
        dir("${PROJECT_DIR}") {
          sh """
            echo "Waiting for API to be ready..."
            sleep 10
            docker compose ${COMPOSE_FILES} exec -T api sh -c "cd /app && npx prisma migrate deploy"
          """
        }
      }
    }

    stage('Health Check') {
      steps {
        dir("${PROJECT_DIR}") {
          sh """
            sleep 3
            echo "=== Container Status ==="
            docker compose ${COMPOSE_FILES} ps
            echo "=== Health Check ==="
            curl -f http://localhost/api/bff/health || echo "WARN: Health check failed, check logs"
          """
        }
      }
    }
  }

  post {
    failure {
      dir("${PROJECT_DIR}") {
        sh "docker compose ${COMPOSE_FILES} logs --tail=200 || true"
      }
    }
    success {
      echo "Deploy completed successfully"
    }
  }
}
