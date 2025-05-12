db:
	docker run --name pg-container -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=shubhs18n -p 5432:5432 -d postgres
