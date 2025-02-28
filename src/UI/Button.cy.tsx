import React from 'react';
import { Button } from './Button';

describe('<Button />', () => {
  it('renders correctly', () => {
    cy.mount(<Button>Click Me</Button>);
    cy.contains('Click Me').should('be.visible');
  });

  it('triggers onClick when clicked', () => {
    const onClick = cy.spy(); // Create a Cypress spy to track clicks
    cy.mount(<Button onClick={onClick}>Click Me</Button>);
    cy.contains('Click Me').click();
    cy.wrap(onClick).should('have.been.calledOnce');
  });

  it('does not trigger onClick when disabled', () => {
   const onClick = cy.spy();
    cy.mount(
      <Button onClick={onClick} disabled={true}>
        Disabled
      </Button>
  );
    cy.contains('Disabled').should('have.attr', 'disabled');
    cy.wrap(onClick).should('not.have.been.called');
  });


  it('applies correct class for dark variant', () => {
    cy.mount(<Button colorVariant='dark'>Dark Button</Button>);
    cy.contains('Dark Button').should('have.class', 'border-black');
  });

  it('applies correct class for light variant', () => {
    cy.mount(<Button colorVariant='light'>Light Button</Button>);
    cy.contains('Light Button').should(
      'have.class',
      'border-primary-light-fill'
    );
  });

  it('applies span background variant class', () => {
    cy.mount(
      <Button spanBgVariant='bg-button-disabled-fill'>Styled Button</Button>
    );
    cy.get('span').should('have.class', 'bg-button-disabled-fill');
  });
});
