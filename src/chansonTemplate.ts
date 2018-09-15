
import moment from 'moment'
import 'moment/locale/fr';


moment.locale('fr')
export default function (chanson) {
    const { title, author, url, content, date, colonnes } = chanson

    const article = document.createElement('article')
    article.style.columnCount = colonnes
    article.classList.add('mh4', 'mv2')
    article.innerHTML = content

    const section =  document.createElement('section')
    section.innerHTML = `<h1 class="small-caps">${title}</h1>
    <p class='f6 i'>${author ? `<span class="author">${author},</span>` : '' }
    <em class="date">dernière modification le ${moment(date).format('LLL')}</em>. <a href="${url}">permalien</a></p>`
    section.appendChild(article)
    return section
}