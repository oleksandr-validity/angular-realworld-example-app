describe('API Testing', () => {

  beforeEach('Login to app',()=>{
    cy.loginToApp()
  })

  it('Verify correct request and response',()=>{

    const articleTitle = 'Title: First Test Article';
    const articleDescription = 'Description of the article';
    const articleBody = 'This is article body';

    cy.intercept('POST', 'https://api.realworld.io/api/articles/').as('postArticles') // intercept required before we make any action to trigger the call we want to intercept

    cy.get('a[routerlink="/editor"]').click()
    cy.get('input[formcontrolname="title"]').type(articleTitle)
    cy.get('input[formcontrolname="description"]').type(articleDescription)
    cy.get('textarea[formcontrolname="body"]').type(articleBody)
    cy.get('button').contains('Publish Article').click()

    cy.wait('@postArticles') // wait for the API call to be completed
      .then(xhr => {
        console.log(xhr)
        //validate request
        expect(xhr.request.body.article.title).to.eq(articleTitle)
        expect(xhr.request.body.article.body).to.eq(articleBody)
        expect(xhr.request.body.article.description).to.eq(articleDescription)

        //validate response
        expect(xhr.response.statusCode).to.eq(201)
        expect(xhr.response.body.article.title).to.eq(articleTitle)
        expect(xhr.response.body.article.body).to.eq(articleBody)
        expect(xhr.response.body.article.description).to.eq(articleDescription)
       // const articleSlug = xhr.response.body.article.
    })

    // Delete article
    cy.get('button').contains('Delete Article').click()
  })
});
