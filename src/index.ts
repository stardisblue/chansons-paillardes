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
const ulElement = document.querySelector('nav ul');


(function buildMenu(chansons) {
    forEach(chansons, (chanson) => {
        const itemElement = document.createElement('li')
        itemElement.classList.add('cf', 'mv2')

        const urlElement = document.createElement('a')
        urlElement.classList.add('fl')
        urlElement.href = "#" + chanson.slug
        urlElement.innerHTML = chanson.title + (chanson.author ? ' (' + chanson.author + ')' : '')
        itemElement.appendChild(urlElement)
        ulElement.appendChild(itemElement)
    })

    main.appendChild(createFooter(1))
})(chansons);

const pages = [];
(function buildChanson(chansons) {
    let pageNumber = 2 // we begin at 2 because of titlePage
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
        pages.push(pageNumber)

        const articleElement = chansonDOM.children[2] as HTMLElement

        const cols = chanson.colonnes || 1

        if (cols === 1) {
            articleElement.appendChild(createFooter(pageNumber))
            pageNumber++
            articleElement.style.width = null
            return
        }


        // heights variables
        const h = {
            firstPage: 900,
            pages: 1000,
            current: 0,
            currentPage: 0,
            optimal: articleElement.offsetHeight / cols
        }

        // creating the cells
        const cells = []
        let cell = []

        forEach(articleElement.children, (pElement: HTMLParagraphElement) => {
            if (cells.length % cols === 0) { // update optimal on next pages
                h.optimal = (articleElement.offsetHeight - h.currentPage) / cols
                // console.log(optimal)
            }
            if (h.current > h.optimal) { // optimal breakpoint
                cells.push(cell)
                cell = []
                h.currentPage += h.current;
                h.current = 0
            }

            const style = pElement.currentStyle || window.getComputedStyle(pElement)
            const height = pElement.offsetHeight + parseInt(style.marginTop) + parseInt(style.marginBottom)
            const futureCount = h.current + height

            if ((futureCount > h.firstPage && cells.length < cols) ||
                (futureCount > h.pages)) { // page breakpoint
                // console.log(cells.length, count)
                cells.push(cell)
                cell = []
                h.currentPage += h.current
                h.current = 0
            }
            h.current += height

            cell.push(pElement)
        })
        if (cell.length !== 0) {// checking if lastcell is not empty
            cells.push(cell)
        }

        // console.log(cells)
        // while (articleDOM.firstChild) { 
        //     // not used because appendChild removes from last child
        //     articleDOM.removeChild(articleDOM.firstChild);
        // }

        // adding the cells to the containers
        // each container has chanson.colonnes columns
        let container = createContainerElement()
        forEach(cells, (cell, index) => {
            const cellDOM = createCellElement(cols)

            forEach(cell, (item) => {
                cellDOM.appendChild(item)
            })

            container.appendChild(cellDOM)

            if ((index + 1) % cols === 0) {
                container.appendChild(createFooter(pageNumber))
                pageNumber++
                articleElement.appendChild(container)
                container = createContainerElement()
            }
        })
        if (container.children.length !== 0) {
            container.appendChild(createFooter(pageNumber))
            pageNumber++
            articleElement.appendChild(container)
        }
        articleElement.style.width = null
    });

    // ---
    // Adding pageNumber to title
    // ---
    const menu = ulElement.getElementsByTagName('li')

    forEach(menu, (li, i) => {
        const p = document.createElement('i')
        p.classList.add('fr', 'print')
        p.innerHTML = pages[i]
        li.appendChild(p)
    })



})(chansons);

/* - helper functions - */
function createContainerElement(): HTMLDivElement {
    const container = document.createElement('div');
    container.classList.add('page', 'cf', 'ph2-ns', 'pb15-ns', 'pb0-p', 'bb-ns-nl', 'b--gray')
    return container
}

function createCellElement(cols): HTMLDivElement {
    const cell = document.createElement('div')
    const percentage = cols !== 3 ? 100 / cols : 'third'
    cell.classList.add('fl', 'w-100', 'w-' + percentage + '-ns', 'w-' + percentage + '-p', 'ph1')
    return cell
}

function createFooter(page: number): HTMLDivElement {
    const div = document.createElement('div')
    div.classList.add('footer', 'print')
    div.innerHTML = '' + page
    div.style.bottom = (((page - 1) * -27.2) + 0.01) + 'cm'
    return div
}

// console.log(pages)

// })


//javascript file


document.getElementById('hamburger').addEventListener('click', event => {
    event.preventDefault()
    
    const sidebar = document.getElementById('sidebar')
    const sidebarWidth = sidebar.getBoundingClientRect().width

    const header = document.querySelector('nav div')
    const marginLeft = parseInt((header.currentStyle || window.getComputedStyle(header)).marginLeft)

    sidebar.classList.toggle('transform-off')

    const hamburger = document.getElementById('hamburger')
    hamburger.style.transform = hamburger.style.transform && (sidebarWidth - marginLeft) > 0 ? '' : 'translate3d(-' + (sidebarWidth - marginLeft) + 'px, 0, 0)'
})

document.getElementById('main').addEventListener('click', outsideClick)
document.getElementById('header').addEventListener('click', outsideClick)

function outsideClick(event) {
    console.log('event')
    document.getElementById('hamburger').style.transform = ''
    document.getElementById('sidebar').classList.add('transform-off')
} 