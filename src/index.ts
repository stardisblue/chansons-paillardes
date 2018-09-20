import forEach from 'lodash/forEach'
import chansonTemplate from './chansonTemplate';


function ready(fn) {
    if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

interface Chanson {
    title: string
    content: string
    author?: string
    date?: string
    url?: string
    slug?: string
    colonnes?: number
    parskip?: string
}

// ready(function () {
const chansons: Chanson[] = window.chansons || []

const main = document.querySelector('main');

(function (chansons) {

})(chansons);

(function buildChanson(chansons) {
    forEach(chansons, (chanson) => {
        chanson.content = chanson.content
            // might break stuff when printing
            // .replace(/\\colonneSuivante/g, '<div class="colonne-suivante"></div>')
            .replace(/\\sauterLigne{(\d+)}/g, (ignore, nb: number) => {
                return '<br/>'.repeat(nb - 1);
            })
            .replace(/\\vspace{([^}]+)}<br \/>/g, '<br style="display: block; margin: $1; line-height: 0px; content: \' \';" />');
        // console.log(chanson.title);
        const chansonDOM = chansonTemplate(chanson);
        main.appendChild(chansonDOM);

        const articleDOM = chansonDOM.children[2]

        const cols = chanson.colonnes || 1

        if (cols > 1) {


            const cells = []
            let cell = []

            const h = {
                firstPage: 900,
                pages: 1000,
                current: 0,
                currentPage: 0,
                optimal: articleDOM.offsetHeight / cols
            }

            forEach(articleDOM.children, (pDOM: HTMLElement) => {
                if (cells.length % cols === 0) { // update optimal on next pages
                    h.optimal = (articleDOM.offsetHeight - h.currentPage) / cols
                    // console.log(optimal)
                }
                if (h.current > h.optimal) { // optimal breakpoint
                    cells.push(cell)
                    cell = []
                    h.currentPage += h.current;
                    h.current = 0
                }

                const style = pDOM.currentStyle || window.getComputedStyle(pDOM);
                const height = pDOM.offsetHeight + parseInt(style.marginTop) + parseInt(style.marginBottom)
                const futureCount = h.current + height

                if ((futureCount > h.firstPage && cells.length < cols) || (futureCount > h.pages)) { // page breakpoint
                    // console.log(cells.length, count)
                    cells.push(cell)
                    cell = []
                    h.currentPage += h.current
                    h.current = 0
                }
                h.current += height

                cell.push(pDOM)
            })
            if (cell.length !== 0) {
                cells.push(cell)
            }

            // console.log(cells)
            // while (articleDOM.firstChild) {
            //     articleDOM.removeChild(articleDOM.firstChild);
            // }
            let container = createContainer()

            forEach(cells, (cell, index) => {
                const cellDOM = createCell(cols)
                forEach(cell, (item) => {
                    cellDOM.appendChild(item)
                })

                container.appendChild(cellDOM)
                if ((index + 1) % cols === 0) {
                    articleDOM.appendChild(container)
                    container = createContainer()
                }
            })
            if (container.children.length !== 0) {
                articleDOM.appendChild(container)
            }

            function createContainer() {
                const container = document.createElement('div');
                container.classList.add('container', 'cf', 'ph2-ns')
                return container
            }

            function createCell(cols) {
                let cell = document.createElement('div')
                const percentage = cols !== 3 ? 100 / cols : 'third'
                cell.classList.add('fl', 'w-' + percentage, 'ph1')
                return cell
            }
        }
    });
})(chansons)



// })



