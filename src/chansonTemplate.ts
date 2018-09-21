
import moment from 'moment'
import 'moment/locale/fr';


moment.locale('fr')
export default function (chanson) {
    const { title, author, url, slug, content, date, colonnes, parskip } = chanson

    const section = document.createElement('section')
    section.classList.add('ma4', 'ma0-p', 'page')

    const h1 = document.createElement('h1')
    h1.classList.add('small-caps', 'anchor')
    h1.innerHTML = title
    h1.id = slug
    section.appendChild(h1)

    const p = document.createElement('p')
    p.classList.add('f6', 'i')
    section.appendChild(p)

    if (author) {
        const authorSpan = document.createElement('span')
        authorSpan.classList.add('author')
        authorSpan.innerHTML = author + '. '
        p.appendChild(authorSpan)
    }

    if (date) {
        const dateSpan = document.createElement('em')
        dateSpan.classList.add('date')
        dateSpan.innerHTML = 'dernière modification le ' + moment(date).format('LLL') + '. '
        p.appendChild(dateSpan)
    }

    const permalien = document.createElement('a')
    permalien.href = '#' + slug
    permalien.innerHTML = 'permalien'
    p.appendChild(permalien)

    const article = document.createElement('article')

    article.classList.add('mv4', 'mv0-p')
    article.style.width = 18 / (chanson.colonnes || 1) + 'cm'
    if (parskip) {
        article.classList.add('p-mt' + parskip)
    }
    article.innerHTML = content
    section.appendChild(article)
    return section
}