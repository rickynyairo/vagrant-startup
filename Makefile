# If you see pwd_unknown showing up, this is why. Re-calibrate your system.
PWD ?= pwd_unknown

# PROJECT_NAME defaults to name of the current directory.
PROJECT_NAME = "sms-management-api"

# Note. If you change this, you also need to update docker-compose.yml.
# only useful in a setting with multiple services/ makefiles.
SERVICE_TARGET := sms-api

# File names
DOCKER_DEV_COMPOSE_FILE := docker/docker-compose.dev.yml
DOCKER_TEST_COMPOSE_FILE := docker/docker-compose.test.yml
DOCKER_PROD_COMPOSE_FILE := docker/docker-compose.prod.yml

# Docker compose project names

DOCKER_TEST_PROJECT := "$(PROJECT_NAME)-test"
DOCKER_PROD_PROJECT := "$(PROJECT_NAME)-prod"
# if vars not set specifically: try default to environment, else fixed value.
# strip to ensure spaces are removed in future editorial mistakes.
# tested to work consistently on popular Linux flavors and Mac.

## >>> Host User Configs

# ifeq ($(user),)
# # USER retrieved from env, UID from shell.
# HOST_USER ?= $(strip $(if $(USER),$(USER),nodummy))
# HOST_UID ?= $(strip $(if $(shell id -u),$(shell id -u),4000))
# else
# # allow override by adding user= and/ or uid=  (lowercase!).
# # uid= defaults to 0 if user= set (i.e. root).
# HOST_USER = $(user)
# HOST_UID = $(strip $(if $(uid),$(uid),0))
# endif

## >>> Host User Configs

THIS_FILE := $(lastword $(MAKEFILE_LIST))
CMD_ARGUMENTS ?= $(cmd)

# export such that its passed to shell functions for Docker to pick up.
export PROJECT_NAME

# all our targets are phony (no files to check).
.PHONY: shell help build rebuild service login test clean prune

# suppress makes own output
#.SILENT:

# shell is the first target. So instead of: make shell cmd="whoami", we can type: make cmd="whoami".
# more examples: make shell cmd="whoami && env", make shell cmd="echo hello container space".
# leave the double quotes to prevent commands overflowing in makefile (things like && would break)
# special chars: '',"",|,&&,||,*,^,[], should all work. Except "$" and "`", if someone knows how, please let me know!).
# escaping (\) does work on most chars, except double quotes (if someone knows how, please let me know)
# i.e. works on most cases. For everything else perhaps more useful to upload a script and execute that.
shell:
ifeq ($(CMD_ARGUMENTS),)
	# no command is given, default to shell
	docker-compose -p $(PROJECT_NAME) run --rm $(SERVICE_TARGET) sh
else
	# run the command
	docker-compose -p $(PROJECT_NAME) run --rm $(SERVICE_TARGET) sh -c "$(CMD_ARGUMENTS)"
endif

# Regular Makefile part for buildpypi itself
help:
	@echo ''
	@echo 'Usage: make [TARGET] [EXTRA_ARGUMENTS]'
	@echo 'Targets:'
	@echo '  build    	build docker --image-- for current user'
	@echo '  rebuild  	rebuild docker --image-- for current user'
	@echo '  test     	test docker --container-- for current user'
	@echo '  service   	run as service --container-- for current user'
	@echo '  login   	run as service and login --container-- for current user'
	@echo '  clean    	remove docker --image-- for current user'
	@echo '  prune    	shortcut for docker system prune -af. Cleanup inactive containers and cache.'
	@echo '  shell      run docker --container-- for current user'
	@echo ''
	@echo 'Extra arguments:'
	@echo 'cmd=:	make cmd="whoami"'
	@echo '# user= and uid= allows to override current user. Might require additional privileges.'
	@echo 'user=:	make shell user=root (no need to set uid=0)'
	@echo 'uid=:	make shell user=dummy uid=4000 (defaults to 0 if user= set)'

rebuild:
	# force a rebuild by passing --no-cache
	docker-compose build --no-cache $(SERVICE_TARGET)

release:
	# run as a (background) service
	docker-compose -p $(DOCKER_PROD_PROJECT) -f $(DOCKER_PROD_COMPOSE_FILE) up -d $(SERVICE_TARGET)

dev:
	# run as a (background) service
	docker-compose -p $(PROJECT_NAME) -f $(DOCKER_DEV_COMPOSE_FILE) up $(SERVICE_TARGET)

database:
	# run the database in the background
	docker-compose -p $(PROJECT_NAME) -f $(DOCKER_DEV_COMPOSE_FILE) up -d mongo

login: service
	# run as a service and attach to it
	docker exec -it $(PROJECT_NAME) sh

build:
	# only build the container. Note, docker does this also if you apply other targets.
	docker-compose build $(SERVICE_TARGET) -f $(DOCKER_DEV_COMPOSE_FILE)

stop:
	# stop running containers
	docker-compose -p $(PROJECT_NAME) -f $(DOCKER_DEV_COMPOSE_FILE) down

clean:
	# remove created images
	@docker-compose -p $(PROJECT_NAME) -f $(DOCKER_DEV_COMPOSE_FILE) down --remove-orphans --rmi all 2>/dev/null \
	&& echo 'Image(s) for "$(PROJECT_NAME)" removed.' \
	|| echo 'Image(s) for "$(PROJECT_NAME)" already removed.'

prune:
	# clean all that is not actively used
	docker system prune -af

## Run project test cases
test:
	${INFO} "Building required docker images for testing"
	@ echo " "
	@ docker-compose -p $(DOCKER_TEST_PROJECT) -f $(DOCKER_TEST_COMPOSE_FILE) build --pull
	${INFO} "Build Completed successfully"
	@ echo " "
	${INFO} "Running tests in docker container"
	@ docker-compose -p $(DOCKER_TEST_PROJECT) -f $(DOCKER_TEST_COMPOSE_FILE) up -d
	${INFO} "Containers are up, run tests ==>>"
	@ docker-compose -p $(DOCKER_TEST_PROJECT) -f $(DOCKER_TEST_COMPOSE_FILE) run $(SERVICE_TARGET) sh -c 'yarn test'
	@ docker-compose -p $(DOCKER_TEST_PROJECT) -f $(DOCKER_TEST_COMPOSE_FILE) run $(SERVICE_TARGET) sh -c 'yarn test:coverage'
	${INFO} "Cleaning workspace after test"
	@ docker-compose -p $(DOCKER_TEST_PROJECT) -f $(DOCKER_TEST_COMPOSE_FILE) down -v

## Colour schemes
NC := "\e[0m"
YELLOW := $(shell tput -Txterm setaf 3)
INFO := @bash -c 'printf $(YELLOW); echo "===> $$1"; printf $(NC)' SOME_VALUE

# ${INFO} "Copying test coverage reports"
# @ bash -c 'if [ -d "coverage" ]; then rm -Rf coverage; fi'
# @ docker cp $$(docker-compose -p $(DOCKER_TEST_PROJECT) -f $(DOCKER_TEST_COMPOSE_FILE) ps -q $(SERVICE_TARGET)):/coverage coverage