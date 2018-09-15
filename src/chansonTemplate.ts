
import moment from 'moment'
import 'moment/locale/fr';


moment.locale('fr')
export default function (chanson) {
    const { title, author, url, content, date, colonnes } = chanson

    const section =  document.createElement('section')
    section.classList.add('ma4--np')
    section.innerHTML = `<h1 class="small-caps">${title}</h1>
    <p class='f6 i'>${author ? `<span class="author">${author},</span>` : '' }
    <em class="date">dernière modification le ${moment(date).format('LLL')}</em>. <a href="${url}">permalien</a></p>`

    const article = document.createElement('article')
    article.style.columnCount = colonnes
    article.innerHTML = content
    
    section.appendChild(article)
    return section
}