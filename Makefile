SRC = index.js	\
	lib/calendar.js	\
	lib/days.js

all: lint test build

build: $(SRC) lib/template.html lib/calendar.css | components
	@component build --dev

components:
	@component install --dev

clean:
	rm -fr build components

lint:
	@./node_modules/.bin/jshint $(SRC)

test:
	@./node_modules/.bin/mocha \
		--reporter spec

.PHONY: clean test lint all
