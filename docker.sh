#!/bin/bash

# Rose Docker Management Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Show usage
show_usage() {
    echo "Rose Docker Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev        Start development environment"
    echo "  prod       Start production environment"
    echo "  stop       Stop all services"
    echo "  restart    Restart all services"
    echo "  logs       Show logs for all services"
    echo "  clean      Clean up containers, images, and volumes"
    echo "  build      Build all images"
    echo "  status     Show status of all services"
    echo "  help       Show this help message"
    echo ""
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Start development environment
start_dev() {
    print_status "Starting development environment..."
    docker-compose -f docker-compose.dev.yml up -d
    print_success "Development environment started!"
    print_status "Services available at:"
    echo "  - Frontend: http://localhost:5000"
    echo "  - Admin Panel: http://localhost:3002"
    echo "  - Backend API: http://localhost:3000"
    echo "  - Database: localhost:5432"
}

# Start production environment
start_prod() {
    print_status "Starting production environment..."
    docker-compose up -d
    print_success "Production environment started!"
    print_status "Services available at:"
    echo "  - Main Site: http://localhost"
    echo "  - Admin Panel: http://admin.localhost"
    echo "  - API: http://api.localhost"
    echo "  - Direct access:"
    echo "    - Frontend: http://localhost:5000"
    echo "    - Admin Panel: http://localhost:3002"
    echo "    - Backend API: http://localhost:3000"
}

# Stop all services
stop_services() {
    print_status "Stopping all services..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    print_success "All services stopped!"
}

# Restart services
restart_services() {
    print_status "Restarting services..."
    stop_services
    if [ "$1" = "dev" ]; then
        start_dev
    else
        start_prod
    fi
}

# Show logs
show_logs() {
    print_status "Showing logs for all services..."
    if docker-compose ps | grep -q "Up"; then
        docker-compose logs -f
    elif docker-compose -f docker-compose.dev.yml ps | grep -q "Up"; then
        docker-compose -f docker-compose.dev.yml logs -f
    else
        print_warning "No services are currently running."
    fi
}

# Clean up
clean_up() {
    print_warning "This will remove all containers, images, and volumes. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Cleaning up..."
        docker-compose down -v --rmi all --remove-orphans
        docker-compose -f docker-compose.dev.yml down -v --rmi all --remove-orphans
        docker system prune -f
        print_success "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Build all images
build_images() {
    print_status "Building all images..."
    docker-compose build --no-cache
    docker-compose -f docker-compose.dev.yml build --no-cache
    print_success "All images built successfully!"
}

# Show status
show_status() {
    print_status "Service Status:"
    echo ""
    echo "Production Services:"
    docker-compose ps
    echo ""
    echo "Development Services:"
    docker-compose -f docker-compose.dev.yml ps
}

# Main script logic
case "$1" in
    "dev")
        check_docker
        start_dev
        ;;
    "prod")
        check_docker
        start_prod
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        check_docker
        restart_services "$2"
        ;;
    "logs")
        show_logs
        ;;
    "clean")
        clean_up
        ;;
    "build")
        check_docker
        build_images
        ;;
    "status")
        show_status
        ;;
    "help"|"--help"|"-h")
        show_usage
        ;;
    "")
        show_usage
        ;;
    *)
        print_error "Unknown command: $1"
        show_usage
        exit 1
        ;;
esac
