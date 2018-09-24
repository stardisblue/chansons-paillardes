import forEach from 'lodash/forEach'
import { filter, map, flatMap, includes, debounce, deburr, intersection, split } from 'lodash'
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
const $main = document.getElementById('main');
const $navigation = document.querySelector('nav ul');
const $sidebar = document.getElementById('sidebar');
const $hamburger = document.getElementById('hamburger');
const $footer = document.getElementById('footer');

(function buildMenu(chansons) {
    forEach(chansons, (chanson) => {
        const $li = document.createElement('li')
        $li.classList.add('cf', 'mv2')
        $li.id = 'nav--' + chanson.slug

        const $url = document.createElement('a')
        $url.classList.add('fl')
        $url.href = "#" + chanson.slug
        $url.innerHTML = chanson.title + (chanson.author ? ' (' + chanson.author + ')' : '')
        $li.appendChild($url)
        $navigation.appendChild($li)
    })

    $footer.appendChild(createFooter(1))
    $footer.appendChild(createFooter(2))
})(chansons);

(function buildChanson(chansons) {
    const pages = [];

    let pageNumber = 3 // we begin at 2 because of titlePage
    forEach(chansons, (chanson) => {
        chanson.content = chanson.content
            // might break stuff when printing
            // .replace(/\\colonneSuivante/g, '<div class="colonne-suivante"></div>')
            .replace(/\\sauterLigne{(\d+)}/g, (ignore, nb: number) => {
                return '<br/>'.repeat(nb - 1);
            })
            .replace(/\\vspace{([^}]+)}<br \/>/g, '<br style="display: block; margin: $1; line-height: 0px; content: \' \';" />');
        // console.log(chanson.title);
        const $chanson = chansonTemplate(chanson);

        $main.appendChild($chanson);
        pages.push(pageNumber)

        const $article = $chanson.children[2] as HTMLElement

        const cols = chanson.colonnes || 1

        if (cols === 1) {
            $footer.appendChild(createFooter(pageNumber))
            pageNumber++
            $article.style.width = null
            return
        }


        // heights variables
        const h = {
            firstPage: 900,
            pages: 1000,
            current: 0,
            currentPage: 0,
            optimal: $article.offsetHeight / cols
        }

        // creating the cells
        const cells = []
        let cell = []

        forEach($article.children, (pElement: HTMLParagraphElement) => {
            if (cells.length % cols === 0) { // update optimal on next pages
                h.optimal = ($article.offsetHeight - h.currentPage) / cols
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
        let $container = createContainerElement()
        forEach(cells, (cell, index) => {
            const $cell = createCellElement(cols)

            forEach(cell, (item) => {
                $cell.appendChild(item)
            })

            $container.appendChild($cell)

            if ((index + 1) % cols === 0) {
                $footer.appendChild(createFooter(pageNumber))
                pageNumber++
                $article.appendChild($container)
                $container = createContainerElement()
            }
        })
        if ($container.children.length !== 0) {
            $footer.appendChild(createFooter(pageNumber))
            pageNumber++
            $article.appendChild($container)
        }
        $article.style.width = null
    });

    // ---
    // Adding pageNumber to title
    // ---
    const $menu = $navigation.getElementsByTagName('li')

    forEach($menu, ($li, i) => {
        const $p = document.createElement('i')
        $p.classList.add('fr', 'print')
        $p.innerHTML = pages[i]
        $li.appendChild($p)
    })
})(chansons);

(function search(chansons) {
    const $noResults = document.getElementById('nav-no-results')

    const $parents = {}
    const $toc = {}

    forEach(chansons, (c) => {
        $parents[c.slug] = document.getElementById('parent--' + c.slug)
        $toc[c.slug] = document.getElementById('nav--' + c.slug)
    })

    const inverted: { [key: string]: string[] } = {}
    forEach(chansons, (chanson) => {
        const tokens: string[] = tokenize(chanson.title)
        tokens.push(...tokenize(chanson.author))
        forEach(tokens, (t) => {
            ; (inverted[t] || (inverted[t] = [])).push(chanson.slug)
        })
    })

    const searchable = map(inverted, (value, key) => ({ token: key, match: value }))

    function tokenize(input) {
        return filter(split(deburr(input).toLocaleLowerCase(), /[^a-z0-9]+/), (t) => t.length >= 2)
    }

    function filterDisplay() {
        const tokens = tokenize(this.value)
        if (tokens.length === 0) {
            resetSearch();
            return
        }

        let results

        forEach(tokens, (t) => {
            const filtered = flatMap(
                filter(searchable, (s) => includes(s.token, t)), 'match')

            if (filtered.length === 0) {
                results = []
                return false
            }

            if (results === undefined) {
                results = filtered
                return
            }

            results = intersection(results, filtered)
        })

        if (results.length === 0) {
            $noResults.classList.remove('dn')
        } else {
            $noResults.classList.add('dn')
        }

        const displayable: { [key: string]: boolean } = {}
        forEach(chansons, (c) => { displayable[c.slug] = false })
        forEach(results, (r) => { displayable[r] = true })

        forEach(displayable, (display, id) => {
            const $section = $parents[id].classList
            const $item = $toc[id].classList
            if (display) {
                $section.remove('dn')
                $item.remove('dn')
            } else {
                $section.add('dn')
                $item.add('dn')
            }
        })
    }

    function resetSearch() {
        forEach(chansons, (c) => {
            $parents[c.slug].classList.remove('dn');
            $toc[c.slug].classList.remove('dn');
        });
        $noResults.classList.add('dn');
    }

    const $searchInput = document.getElementById('searchbar') as HTMLInputElement
    const $cleanSearch = document.getElementById('clean-search')
    $cleanSearch.addEventListener('click', (event) => {
        event.preventDefault()
        $searchInput.value = ''
        resetSearch()
    })
    $searchInput.addEventListener('keydown', debounce(filterDisplay, 300));

    $searchInput.addEventListener('focus', (event) => {
        event.preventDefault();
        $sidebar.classList.remove('transform-off')
        $hamburger.style.transform = 'rotate(90deg)'
    })

    // $searchInput.addEventListener('blur', (event) => {
    //     console.log(event)
    //     $hamburger.style.transform = ''
    //     $sidebar.classList.add('transform-off')
    // })
})(chansons);

/* - helper functions - */
function createContainerElement(): HTMLDivElement {
    const $container = document.createElement('div');
    $container.classList.add('page', 'cf', 'ph2-ns', 'pb15-ns', 'pb0-p', 'bb-ns-nl', 'b--gray')
    return $container
}

function createCellElement(cols): HTMLDivElement {
    const $cell = document.createElement('div')
    const percentage = cols !== 3 ? 100 / cols : 'third'
    $cell.classList.add('fl', 'w-100', 'w-' + percentage + '-ns', 'w-' + percentage + '-p', 'ph1')
    return $cell
}

function createFooter(page: number): HTMLDivElement {
    const $div = document.createElement('div')
    $div.classList.add('footer')
    $div.innerHTML = '' + page
    $div.style.bottom = (((page - 1) * -27.2) + 0.01) + 'cm'
    return $div
}

// console.log(pages)

// })


//javascript file

// slidable sidebar
$hamburger.addEventListener('click', clickHamburger)

$main.addEventListener('click', outsideClick)
document.getElementById('header').addEventListener('click', outsideClick)

function clickHamburger(event) {
    event.preventDefault();

    $sidebar.classList.toggle('transform-off')
    $hamburger.style.transform = $hamburger.style.transform ? '' : 'rotate(90deg)'
}

function outsideClick(event) {
    $hamburger.style.transform = ''
    $sidebar.classList.add('transform-off')
}