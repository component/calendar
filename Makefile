
SRC = index.js	\
	lib/template.js	\
	lib/Calendar.js	\
	lib/Days.js \
	lib/calendar.css

build: components $(SRC)
	@component build --dev

components:
	@component install --dev

lib/template.js: lib/template.html
	@component convert $<

clean:
	rm -fr build components lib/template.js

test:
	@./node_modules/.bin/mocha \
		--reporter spec

.PHONY: clean test
