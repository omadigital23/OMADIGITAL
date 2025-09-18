#!/bin/bash

# OMA Digital Production Deployment Script
# Comprehensive deployment automation for Unix/Linux systems

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    printf "${1}${2}${NC}\n"
}

# Function to print section headers
print_header() {
    echo
    print_color $PURPLE "========================================"
    print_color $PURPLE "  $1"
    print_color $PURPLE "========================================"
    echo
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to validate environment variables
validate_env_vars() {
    local missing_vars=()
    
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
        missing_vars+=("NEXT_PUBLIC_SUPABASE_URL")
    fi
    
    if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        missing_vars+=("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    fi
    
    if [ -z "$GOOGLE_AI_API_KEY" ]; then
        missing_vars+=("GOOGLE_AI_API_KEY")
    fi
    
    if [ -z "$JWT_SECRET" ]; then
        missing_vars+=("JWT_SECRET")
    fi
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_color $YELLOW "Warning: Missing environment variables:"
        for var in "${missing_vars[@]}"; do
            print_color $YELLOW "  - $var"
        done
        echo
        
        read -p "Do you want to set them now? (y/N): " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            for var in "${missing_vars[@]}"; do
                read -p "Enter $var: " value
                export $var="$value"
            done
        else
            print_color $RED "Deployment cannot continue without required environment variables"
            exit 1
        fi
    fi
}

# Function to check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check Node.js
    if command_exists node; then
        NODE_VERSION=$(node --version)
        print_color $GREEN "✅ Node.js: $NODE_VERSION"
    else
        print_color $RED "❌ Node.js is not installed"
        print_color $YELLOW "Please install Node.js from https://nodejs.org/"
        exit 1
    fi
    
    # Check npm
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        print_color $GREEN "✅ npm: $NPM_VERSION"
    else
        print_color $RED "❌ npm is not available"
        exit 1
    fi
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_color $RED "❌ package.json not found"
        print_color $YELLOW "Please run this script from the project root directory"
        exit 1
    fi
    
    print_color $GREEN "✅ All prerequisites met"
}

# Function to show deployment menu
show_menu() {
    print_header "OMA Digital Production Deployment"
    
    echo "Select deployment type:"
    echo "1. Full Production Deployment (recommended)"
    echo "2. Dry Run (test without changes)"
    echo "3. Production Checklist Only"
    echo "4. Security Validation Only"
    echo "5. Performance Testing Only"
    echo "6. TTS/STT Browser Testing Only"
    echo "7. Setup Monitoring Only"
    echo "8. Exit"
    echo
}

# Function to run deployment based on choice
run_deployment() {
    local choice=$1
    
    case $choice in
        1)
            print_header "Running Full Production Deployment"
            node deploy-to-production.js
            ;;
        2)
            print_header "Running Dry Run Deployment"
            node deploy-to-production.js --dry-run
            ;;
        3)
            print_header "Running Production Checklist"
            npm run production:checklist
            ;;
        4)
            print_header "Running Security Validation"
            npm run security:validate
            ;;
        5)
            print_header "Running Performance Testing"
            npm run performance:test
            ;;
        6)
            print_header "Running TTS/STT Browser Testing"
            npm run tts-stt:test
            ;;
        7)
            print_header "Setting Up Monitoring"
            npm run monitoring:setup
            ;;
        8)
            print_color $YELLOW "Deployment cancelled by user"
            exit 0
            ;;
        *)
            print_color $RED "Invalid choice. Running full deployment..."
            node deploy-to-production.js
            ;;
    esac
}

# Function to show success message
show_success() {
    print_header "DEPLOYMENT SUCCESSFUL!"
    
    print_color $GREEN "🎉 Your application is now ready for production!"
    echo
    print_color $CYAN "Next steps:"
    print_color $CYAN "1. Monitor the application for the first 24 hours"
    print_color $CYAN "2. Check monitoring dashboards regularly"
    print_color $CYAN "3. Review performance metrics"
    print_color $CYAN "4. Validate all functionality works as expected"
    echo
    print_color $CYAN "Monitoring endpoints:"
    print_color $CYAN "- Health Check: /api/health"
    print_color $CYAN "- Admin Dashboard: /admin"
    echo
    print_color $CYAN "For detailed information, see: PRODUCTION_DEPLOYMENT_GUIDE.md"
}

# Function to show failure message
show_failure() {
    print_header "DEPLOYMENT FAILED"
    
    print_color $RED "❌ Deployment encountered errors"
    echo
    print_color $YELLOW "Please check the error messages above and:"
    print_color $YELLOW "1. Fix any configuration issues"
    print_color $YELLOW "2. Ensure all environment variables are set"
    print_color $YELLOW "3. Check network connectivity"
    print_color $YELLOW "4. Review the deployment logs"
    echo
    print_color $YELLOW "For help, see: PRODUCTION_DEPLOYMENT_GUIDE.md"
    echo
    print_color $YELLOW "Common solutions:"
    print_color $YELLOW "- Check environment variables: env | grep -E '(SUPABASE|GOOGLE|JWT)'"
    print_color $YELLOW "- Test database connection: npm run test:db"
    print_color $YELLOW "- Verify build: npm run build"
    print_color $YELLOW "- Check logs: tail -f /var/log/oma-*.log"
}

# Function to setup logging
setup_logging() {
    local log_dir="/var/log"
    local log_file="$log_dir/oma-deployment-$(date +%Y%m%d-%H%M%S).log"
    
    # Create log directory if it doesn't exist (with sudo if needed)
    if [ ! -d "$log_dir" ]; then
        if [ "$EUID" -ne 0 ]; then
            print_color $YELLOW "Creating log directory requires sudo privileges"
            sudo mkdir -p "$log_dir"
        else
            mkdir -p "$log_dir"
        fi
    fi
    
    # Start logging
    exec 1> >(tee -a "$log_file")
    exec 2> >(tee -a "$log_file" >&2)
    
    print_color $CYAN "Logging to: $log_file"
}

# Function to cleanup on exit
cleanup() {
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        show_success
    else
        show_failure
    fi
    
    exit $exit_code
}

# Main execution
main() {
    # Setup signal handlers
    trap cleanup EXIT
    trap 'exit 130' INT  # Ctrl+C
    trap 'exit 143' TERM # Termination
    
    # Setup logging
    setup_logging
    
    # Check prerequisites
    check_prerequisites
    
    # Validate environment variables
    validate_env_vars
    
    # Show menu and get user choice
    show_menu
    read -p "Enter your choice (1-8): " choice
    
    # Validate choice
    if ! [[ "$choice" =~ ^[1-8]$ ]]; then
        print_color $YELLOW "Invalid choice. Using default (1)..."
        choice=1
    fi
    
    # Run deployment
    print_color $CYAN "Starting deployment..."
    echo
    
    run_deployment $choice
}

# Help function
show_help() {
    echo "OMA Digital Production Deployment Script"
    echo
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -v, --version  Show version information"
    echo "  --dry-run      Run in dry-run mode"
    echo "  --checklist    Run production checklist only"
    echo "  --security     Run security validation only"
    echo "  --performance  Run performance testing only"
    echo "  --monitoring   Setup monitoring only"
    echo
    echo "Environment Variables:"
    echo "  NEXT_PUBLIC_SUPABASE_URL      Supabase project URL (required)"
    echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY Supabase anonymous key (required)"
    echo "  GOOGLE_AI_API_KEY             Google AI API key (required)"
    echo "  JWT_SECRET                    JWT secret key (required)"
    echo "  SLACK_WEBHOOK_URL             Slack webhook for alerts (optional)"
    echo "  ALERT_RECIPIENTS              Email addresses for alerts (optional)"
    echo
    echo "Examples:"
    echo "  $0                    # Interactive deployment"
    echo "  $0 --dry-run         # Test deployment without changes"
    echo "  $0 --checklist       # Run production checklist only"
    echo "  $0 --security        # Run security validation only"
}

# Parse command line arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    -v|--version)
        echo "OMA Digital Production Deployment v2.0.0"
        exit 0
        ;;
    --dry-run)
        setup_logging
        check_prerequisites
        validate_env_vars
        run_deployment 2
        ;;
    --checklist)
        setup_logging
        check_prerequisites
        validate_env_vars
        run_deployment 3
        ;;
    --security)
        setup_logging
        check_prerequisites
        validate_env_vars
        run_deployment 4
        ;;
    --performance)
        setup_logging
        check_prerequisites
        validate_env_vars
        run_deployment 5
        ;;
    --monitoring)
        setup_logging
        check_prerequisites
        validate_env_vars
        run_deployment 7
        ;;
    "")
        # No arguments, run interactive mode
        main
        ;;
    *)
        print_color $RED "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac