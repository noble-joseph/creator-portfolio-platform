import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Home from '../pages/Home';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
  },
}));

// Mock the background image
vi.mock('../assets/background.png', () => ({
  default: 'mocked-background.png',
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Home Component', () => {
  it('renders the main heading', () => {
    renderWithRouter(<Home />);
    
    const heading = screen.getByText('Welcome to the Creator Platform');
    expect(heading).toBeInTheDocument();
  });

  it('renders the description text', () => {
    renderWithRouter(<Home />);
    
    const description = screen.getByText(/Showcase your creativity, connect with other artists/);
    expect(description).toBeInTheDocument();
  });

  it('renders feature cards', () => {
    renderWithRouter(<Home />);
    
    expect(screen.getByText('Showcase Your Work')).toBeInTheDocument();
    expect(screen.getByText('Connect & Collaborate')).toBeInTheDocument();
    expect(screen.getByText('Grow Your Career')).toBeInTheDocument();
  });

  it('renders login and register buttons', () => {
    renderWithRouter(<Home />);
    
    const loginButton = screen.getByText('Login');
    const registerButton = screen.getByText('Get Started');
    
    expect(loginButton).toBeInTheDocument();
    expect(registerButton).toBeInTheDocument();
  });

  it('renders statistics section', () => {
    renderWithRouter(<Home />);
    
    expect(screen.getByText('1000+')).toBeInTheDocument();
    expect(screen.getByText('5000+')).toBeInTheDocument();
    expect(screen.getByText('500+')).toBeInTheDocument();
    
    expect(screen.getByText('Active Creators')).toBeInTheDocument();
    expect(screen.getByText('Portfolio Views')).toBeInTheDocument();
    expect(screen.getByText('Collaborations')).toBeInTheDocument();
  });

  it('has correct links for buttons', () => {
    renderWithRouter(<Home />);
    
    const loginLink = screen.getByText('Login').closest('a');
    const registerLink = screen.getByText('Get Started').closest('a');
    
    expect(loginLink).toHaveAttribute('href', '/login');
    expect(registerLink).toHaveAttribute('href', '/register');
  });
});
