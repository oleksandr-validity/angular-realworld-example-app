describe('API Testing', () => {

  beforeEach('Login to app',()=>{
    cy.intercept('GET', 'https://api.realworld.io/api/tags', {fixture: 'tags.json'}).as('getTags')
    //3rd parameter {fixture:...} is a value we want to use as a response
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

  it('Mock API response for Popular Tags section', ()=>{
    cy.wait('@getTags')
    cy.get('div.tag-list') // validate that modified response is reflected in the UI
      .should('contain', 'welcome')
      .and('contain', 'cypress')
      .and('contain', 'qa')
      .and('contain', 'automation')
  })

  it('Verify global feed likes count', ()=>{
    cy.intercept('GET', 'https://api.realworld.io/api/articles*', {fixture: 'articles.json'}) //Mock API response with articles
    cy.contains('a', 'Title 1').parent().find('button').should('contain', 1)
    cy.contains('a', 'Title 2').parent().find('button').should('contain', 8)

    cy.fixture('articles.json').then(file => {
      const articleSlug = file.articles[1].slug
      file.articles[1].favoritesCount = 9
      // Mock API response after click on the like button
      cy.intercept('POST', 'https://api.realworld.io/api/articles/'+ articleSlug+'/favorite', file)
    })

    cy.contains('a', 'Title 2').parent().find('button').click().should('contain', 9)
  })
});
