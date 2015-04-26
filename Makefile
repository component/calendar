
SRC = index.js	\
	lib/calendar.js	\
	lib/days.js \
	lib/template.html \
	lib/calendar.css

build: $(SRC) | components
	@component build --dev

components:
	@component install --dev

clean:
	rm -fr build components

test:
	@./node_modules/.bin/mocha \
		--reporter spec

.PHONY: clean test
