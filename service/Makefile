API_EVENT=events/api.json
SCHEDULER_EVENT=events/scheduler.json
ENVIRON=events/environment.json

default: build

build: build-api build-scheduler

build-api:
	go build -o .out/api cmd/api-lambda/main.go

build-scheduler:
	go build -o .out/scheduler cmd/scheduler-lambda/main.go

test:
	go test ./... -cover

test-report:
	go test -v -coverprofile ".out/cover.out" ./...
	go tool cover -html ".out/cover.out" -o ".out/cover.html"
	start ".out/cover.html"

clean:
	go clean
	go clean -testcache

sam: build
	sam build

invoke-api: sam
	sam local invoke OpenTeeApi --event $(API_EVENT) --env-vars $(ENVIRON)

invoke-scheduler: sam
	sam local invoke OpenTeeScheduler --event $(SCHEDULER_EVENT) --env-vars $(ENVIRON)

serve-local: sam
	ENV=local sam local start-lambda --env-vars $(ENVIRON)

deploy: sam
	sam deploy --guided
