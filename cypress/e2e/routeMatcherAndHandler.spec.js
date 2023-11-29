describe('API testing with RouteMatcher and RouteHandler', () => {

  beforeEach('Login to app',()=>{
    //option 1 - 3rd parameter {fixture:...} is a value we want to use as a response
    //cy.intercept('GET', 'https://api.realworld.io/api/tags', {fixture: 'tags.json'}).as('getTags')

    //option 2 - using routeMatcher
    cy.intercept({method: 'GET', path: 'tags'}, {fixture: 'tags.json'}).as('getTags')
    cy.loginToApp()
  })

  it('Intercept & Modify request and response',()=>{

    const articleTitle = 'Title: First Test Article';
    const articleDescription = 'Description of the article';
    const articleBody = 'This is article body';

    // #1 - modifying REQUEST call using RouteHandler
    // cy.intercept('POST', '**/articles', (req)=>{
    //   req.body.article.title = articleTitle + '[Intercepted]'
    // }).as('postArticles')

    // #2 - modifying RESPONSE call using RouteHandler
    cy.intercept('POST', '**/articles', (req)=>{
      req.reply( res => {
        expect(res.body.article.title).to.eq(articleTitle) // validate original Title name in response
        res.body.article.title = articleTitle + '[Intercepted]' // modify Title name in response
      })
    }).as('postArticles')

    // Creating article in the UI
    cy.get('a[routerlink="/editor"]').click()
    cy.get('input[formcontrolname="title"]').type(articleTitle)
    cy.get('input[formcontrolname="description"]').type(articleDescription)
    cy.get('textarea[formcontrolname="body"]').type(articleBody)
    cy.get('button').contains('Publish Article').click()

    cy.wait('@postArticles') // wait for the API call to be completed
      .then(xhr => {
        console.log(xhr)
        //validate request
        // expect(xhr.request.body.article.title).to.eq(articleTitle)

        //validate modified response
        expect(xhr.response.statusCode).to.eq(201)
        expect(xhr.response.body.article.title).to.eq(articleTitle + '[Intercepted]')
      })

    cy.wait(1000)
    // Delete article
    cy.get('button').contains('Delete Article').click()
  })


})
