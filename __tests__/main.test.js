/**
 * @file main
 * @author imcuttle
 * @date 2018/4/4
 */
const remark = require('remark')
const stringify = require('remark-rehype')
const html = require('rehype-stringify')
const remarkHeadingId = require('../')
const { formatDefaultId } = require('../util')

describe('remarkHeadingId', function() {
  it('custom header', function() {
    let { contents } = remark()
      .data('settings', {
        position: false
      })
      .use(remarkHeadingId)
      .use(stringify)
      .use(html).processSync(`# cus head1 {#idd-id}
# cus head2 {#idd id}
# cus head3 {#中文 id}`)

    expect(contents).toMatchInlineSnapshot(`
"<h1 id=\\"idd-id\\">cus head1</h1>
<h1 id=\\"idd id\\">cus head2</h1>
<h1 id=\\"中文 id\\">cus head3</h1>"
`)
  })

  it('default header values', function() {
    const values = new Map()
    values
      .set('title', 'title')
      .set('multiple words', 'multiple-words')
      .set('Multiple Words With Case', 'multiple-words-with-case')
      .set('extra     spaces  ', 'extra-spaces')
      .set('special (characters) *_-+=[]{}<>,./?&^%$#@!`~ ', 'special-characters')
      .forEach((value, key) => expect(formatDefaultId(key)).toBe(value))
  })

  it('defaults option off by default', function() {
    let { contents } = remark()
      .data('settings', {
        position: false
      })
      .use(remarkHeadingId)
      .use(stringify)
      .use(html).processSync(`# head
# cus head1 {#idd-id}`)

    expect(contents).toMatchInlineSnapshot(`
"<h1>head</h1>
<h1 id=\\"idd-id\\">cus head1</h1>"
`)
  })

  it('defaults option', function() {
    let { contents } = remark()
      .data('settings', {
        position: false
      })
      .use(remarkHeadingId, { defaults: true })
      .use(stringify)
      .use(html).processSync(`# head
# cus head1 {#idd-id}`)

    expect(contents).toMatchInlineSnapshot(`
"<h1 id=\\"head\\">head</h1>
<h1 id=\\"idd-id\\">cus head1</h1>"
`)
  })

  it('defaults with uniqueDefaults should generate distinct ids', function() {
    let { contents } = remark()
      .data('settings', {
        position: false
      })
      .use(remarkHeadingId, { defaults: true, uniqueDefaults: true })
      .use(stringify)
      .use(html).processSync(` ## heading
### introduction
### argument
## heading
### introduction
### argument`)
    expect(contents).toMatchInlineSnapshot(`
"<h2 id=\\"heading\\">heading</h2>
<h3 id=\\"introduction\\">introduction</h3>
<h3 id=\\"argument\\">argument</h3>
<h2 id=\\"heading-1\\">heading</h2>
<h3 id=\\"introduction-1\\">introduction</h3>
<h3 id=\\"argument-1\\">argument</h3>"
`)
  })

  it('defaults with uniqueDefaults and defaultPrefix should generate distinct ids, prefixed by defaultPrefix', function() {
    let { contents } = remark()
      .data('settings', {
        position: false
      })
      .use(remarkHeadingId, { defaults: true, uniqueDefaults: true, defaultPrefix: 'somePrefix' })
      .use(stringify)
      .use(html).processSync(` ## heading
### introduction
### argument
## heading
### introduction
### argument`)
    expect(contents).toMatchInlineSnapshot(`
"<h2 id=\\"somePrefix-heading\\">heading</h2>
<h3 id=\\"somePrefix-introduction\\">introduction</h3>
<h3 id=\\"somePrefix-argument\\">argument</h3>
<h2 id=\\"somePrefix-heading-1\\">heading</h2>
<h3 id=\\"somePrefix-introduction-1\\">introduction</h3>
<h3 id=\\"somePrefix-argument-1\\">argument</h3>"
`)
  })

  it('should parse well which contains inline syntax', function() {
    let { contents } = remark()
      .data('settings', {
        position: false
      })
      .use(remarkHeadingId, { defaults: true })
      .use(stringify)
      .use(html).processSync(`
# head \`heada\`
# My Great Heading
## head **headb**
## head ~~headc~~
# cus \`head1\` {#idd-id}
## cus **head2** {#idd id}
## cus ~~head2~~  {#idd id}`)

    expect(contents).toMatchInlineSnapshot(`
"<h1 id=\\"head-heada\\">head <code>heada</code></h1>
<h1 id=\\"my-great-heading\\">My Great Heading</h1>
<h2 id=\\"head-headb\\">head <strong>headb</strong></h2>
<h2 id=\\"head-headc\\">head <del>headc</del></h2>
<h1 id=\\"idd-id\\">cus <code>head1</code></h1>
<h2 id=\\"idd id\\">cus <strong>head2</strong></h2>
<h2 id=\\"idd id\\">cus <del>head2</del> </h2>"
`)
  })
})
