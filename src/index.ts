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
    colonnes?: number
    parskip?: string
}

ready(function () {
    const chansons: Chanson[] = window.chansons || []

    const main = document.querySelector('main')

    forEach(chansons, (chanson) => {

        chanson.content = chanson.content
            .replace(/\\colonneSuivante/g, '<div class="colonne-suivante"></div>')
            .replace(/\\sauterLigne{(\d+)}/g, (ignore, nb: number) => {
                return '<br/>'.repeat(nb - 1)
            })
            .replace(/\\choeur{([^}]+)}/g, '[$1]')
            .replace(/\\vspace{([^}]+)}<br \/>/g, '<br style="display: block; margin: $1; line-height: 0px; content: \' \';" />')
        
        console.log(chanson.title)

        main.appendChild(chansonTemplate(chanson))
    })
})