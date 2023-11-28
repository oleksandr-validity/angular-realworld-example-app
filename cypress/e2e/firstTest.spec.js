describe('Test with backend', () => {

  beforeEach('Login to app',()=>{
    cy.loginToApp()
  })

  it('Test',()=>{
    cy.log('Yeeeey')
  })
});
