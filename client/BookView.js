const m = require('mithril');
const dateformat = require('dateformat');
const TopNavView = require('./TopNavView');
const LeftNavView = require('./LeftNavView');
const actions = require('./modelactions');

function drawBook(item, lastPurchased) {
    return [
        lastPurchased ?
            m('div', { class: 'row alert alert-warning' }, 'You purchased this item on ' + dateformat(new Date(lastPurchased), 'isoDate')) :
            null,
        m('div', { class: 'row' },
            m('div', { class: 'col-md-auto' },
                m('img', { src: 'book-clip-art-20.jpg' })
            ),
            m('div', { class: 'col' },
                m('h3', { class: 'row' }, item.title),
                m('div', { class: 'row' }, item.author),
                m('div', { class: 'row' }, '$' + item.price.toFixed(2)),
                m('div', { class: 'row' }, 'isbn: ' + item.isbn),
            )
        ),
        m('div', { class: 'row' },
            'Description: this is supposed to be the description, but we have no ' +
            'content here yet. ' +
            'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?'
        )
    ]
}

function buy(isbn) {
    actions.setCartItem(isbn, 1);
    m.route.set('/cart');
}

function drawBuy(item) {
    if (item.inventory === 0) {
        return m('div', { class: 'row' }, 'This item is currently out of stock');
    } else {
        return [
            item.inventory <= 5 ?
                m('div', { class: 'row alert alert-warning' }, 'Only ' + item.inventory + ' items left.') :
                null,
            m('div', { class: 'row justify-content-center' },
                m('button', { class: 'btn btn-primary', onclick: () => { buy(item.isbn); } }, 'Add to Cart')
            )
        ]
    }
}

function BookView({ attrs }) {
    let isbn = attrs.isbn;
    let book;
    let user;
    let lastPurchased = null;

    async function oninit({ attrs }) {
        try {
            book = (await m.request({
                method: 'POST',
                url: MITHRIL_SERVER_URL + '/listproducts',
                body: { isbn: [isbn] }
            }))[0];
            user = actions.getModel().user;
            if (user != null) {
                let shoppingHistory = await m.request({
                    method: 'POST',
                    url: MITHRIL_SERVER_URL + '/listshoppinghistory',
                    body: { token: user.token }
                });
                shoppingHistory.reverse();
                let found = shoppingHistory.find(history => history.items.find(item => item.isbn === isbn));
                if (found) lastPurchased = found.timestamp;
            }
        } catch (e) {
            console.log(e);
        }
    }

    function view({ attrs }) {
        return [
            m(TopNavView),
            m('main', { role: 'main', class: 'container' },
                m('div', { class: 'row' },
                    m('div', { class: 'col-md-3' },
                        m(LeftNavView)
                    ),
                    m('div', { class: 'col-md-7' },
                        book ? drawBook(book, lastPurchased) : ''
                    ),
                    m('div', { class: 'col-md-2 alert alert-success' },
                        book ? drawBuy(book) : ''
                    )
                ),
            ),
        ];
    }

    return { oninit, view };
}

module.exports = BookView;
