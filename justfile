build:
	ncc build index.js --license LICENSE

test: build
	act
