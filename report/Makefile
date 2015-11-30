
.DELETE_ON_ERROR:

all: main.pdf

main.pdf: main.tex bibliography.bib system.pdf
	xelatex main.tex
	bibtex main
	xelatex main.tex
	while grep 'Rerun to get ' main.log ; do xelatex main.tex ; done

system.pdf: system.svg
	inkscape -Cz --export-pdf=system.pdf -f system.svg

clean:
	rm -f *.aux *.bbl *.blg *.ent *.log main.pdf main.out system.pdf
