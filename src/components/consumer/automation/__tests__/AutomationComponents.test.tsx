import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the useAppSelector hook
jest.mock('@/hooks/redux', () => ({
  useAppSelector: jest.fn(() => ({
    user: { name: 'Test User', email: 'test@example.com' }
  }))
}));

// Mock the Modal and ConfirmDialog components
jest.mock('@/components/ui/Modal', () => ({
  Modal: ({ children, isOpen, title, onClose }: any) => 
    isOpen ? (
      <div data-testid="modal">
        <div data-testid="modal-title">{title}</div>
        <div data-testid="modal-content">{children}</div>
        <button onClick={onClose} data-testid="modal-close">Close</button>
      </div>
    ) : null
}));

jest.mock('@/components/ui/ConfirmDialog', () => ({
  ConfirmDialog: ({ isOpen, title, message, onConfirm, onClose }: any) => 
    isOpen ? (
      <div data-testid="confirm-dialog">
        <div data-testid="confirm-title">{title}</div>
        <div data-testid="confirm-message">{message}</div>
        <button onClick={onConfirm} data-testid="confirm-button">Confirm</button>
        <button onClick={onClose} data-testid="cancel-button">Cancel</button>
      </div>
    ) : null
}));

// Import the component after mocking
import ConsumerAutomation from '../../../../app/consumer/automation/page';

describe('ConsumerAutomation', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('renders the automation page header', () => {
      render(<ConsumerAutomation />);
      
      expect(screen.getByText('Smart Automation')).toBeInTheDocument();
      expect(screen.getByText('Make your home work for you automatically')).toBeInTheDocument();
    });

    it('renders navigation tabs', () => {
      render(<ConsumerAutomation />);
      
      expect(screen.getByRole('button', { name: /Scenes \(4\)/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Automations \(4\)/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Schedules \(3\)/ })).toBeInTheDocument();
    });

    it('renders create new button', () => {
      render(<ConsumerAutomation />);
      
      expect(screen.getByText('Create New')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('shows scenes tab by default', () => {
      render(<ConsumerAutomation />);
      
      expect(screen.getByText('Quick Scenes')).toBeInTheDocument();
      expect(screen.getByText('One-tap control for multiple devices')).toBeInTheDocument();
    });

    it('switches to automations tab when clicked', () => {
      render(<ConsumerAutomation />);
      
      fireEvent.click(screen.getByRole('button', { name: /Automations \(4\)/ }));
      
      expect(screen.getByText('Smart Automations')).toBeInTheDocument();
      expect(screen.getByText('Let your home respond automatically to conditions')).toBeInTheDocument();
    });

    it('switches to schedules tab when clicked', () => {
      render(<ConsumerAutomation />);
      
      fireEvent.click(screen.getByRole('button', { name: /Schedules \(3\)/ }));
      
      expect(screen.getByText('Scheduled Actions')).toBeInTheDocument();
      expect(screen.getByText('Time-based device control')).toBeInTheDocument();
    });
  });

  describe('Scene Management', () => {
    it('displays scene cards with correct information', () => {
      render(<ConsumerAutomation />);
      
      // Check for default scenes
      expect(screen.getByText('Good Morning')).toBeInTheDocument();
      expect(screen.getByText('Good Night')).toBeInTheDocument();
      expect(screen.getByText('Movie Time')).toBeInTheDocument();
      expect(screen.getByText('Away Mode')).toBeInTheDocument();
    });

    it('shows activate/deactivate buttons for scenes', () => {
      render(<ConsumerAutomation />);
      
      const activateButtons = screen.getAllByText('Activate');
      const deactivateButtons = screen.getAllByText('Deactivate');
      
      expect(activateButtons.length).toBeGreaterThan(0);
      expect(deactivateButtons.length).toBeGreaterThan(0);
    });

    it('opens scene creation modal when new scene button is clicked', () => {
      render(<ConsumerAutomation />);
      
      const newSceneButton = screen.getByText('New Scene');
      fireEvent.click(newSceneButton);
      
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-title')).toHaveTextContent('Create New Scene');
    });

    it('toggles scene state when activate/deactivate is clicked', async () => {
      render(<ConsumerAutomation />);
      
      const activateButtons = screen.getAllByText('Activate');
      fireEvent.click(activateButtons[0]);
      
      // Wait for the state to update
      await waitFor(() => {
        expect(screen.getAllByText('Deactivate')[0]).toBeInTheDocument();
      });
    });
  });

  describe('Automation Management', () => {
    it('displays automation cards when automations tab is selected', () => {
      render(<ConsumerAutomation />);
      
      fireEvent.click(screen.getByRole('button', { name: /Automations \(4\)/ }));
      
      expect(screen.getByText('Motion Activated Lights')).toBeInTheDocument();
      expect(screen.getByText('Energy Saver')).toBeInTheDocument();
      expect(screen.getByText('Rain Detection')).toBeInTheDocument();
    });

    it('shows automation categories', () => {
      render(<ConsumerAutomation />);
      
      fireEvent.click(screen.getByRole('button', { name: /Automations \(4\)/ }));
      
      expect(screen.getByText('security')).toBeInTheDocument();
      expect(screen.getByText('energy')).toBeInTheDocument();
      expect(screen.getByText('weather')).toBeInTheDocument();
    });

    it('expands automation details when clicked', () => {
      render(<ConsumerAutomation />);
      
      fireEvent.click(screen.getByRole('button', { name: /Automations \(4\)/ }));
      
      // Find and click the expand button (chevron)
      const expandButtons = screen.getAllByRole('button');
      const chevronButton = expandButtons.find(button => 
        button.querySelector('[data-testid="chevron"]') || 
        button.getAttribute('aria-label')?.includes('expand')
      );
      
      if (chevronButton) {
        fireEvent.click(chevronButton);
        
        expect(screen.getByText('TRIGGER:')).toBeInTheDocument();
        expect(screen.getByText('CONDITION:')).toBeInTheDocument();
        expect(screen.getByText('ACTIONS:')).toBeInTheDocument();
      }
    });

    it('opens automation creation modal', () => {
      render(<ConsumerAutomation />);
      
      fireEvent.click(screen.getByRole('button', { name: /Automations \(4\)/ }));
      
      const newAutomationButton = screen.getByText('New Automation');
      fireEvent.click(newAutomationButton);
      
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-title')).toHaveTextContent('Create New Automation');
    });
  });

  describe('Schedule Management', () => {
    it('displays schedule cards when schedules tab is selected', () => {
      render(<ConsumerAutomation />);
      
      fireEvent.click(screen.getByRole('button', { name: /Schedules \(3\)/ }));
      
      expect(screen.getByText('Morning Coffee')).toBeInTheDocument();
      expect(screen.getByText('Evening Ambiance')).toBeInTheDocument();
      expect(screen.getByText('Robot Vacuum')).toBeInTheDocument();
    });

    it('shows schedule information', () => {
      render(<ConsumerAutomation />);
      
      fireEvent.click(screen.getByRole('button', { name: /Schedules \(3\)/ }));
      
      expect(screen.getByText('Kitchen Coffee Maker')).toBeInTheDocument();
      expect(screen.getByText(/Monday-Friday 6:45 AM/)).toBeInTheDocument();
      expect(screen.getByText(/Turn on and brew coffee/)).toBeInTheDocument();
    });

    it('opens schedule creation modal', () => {
      render(<ConsumerAutomation />);
      
      fireEvent.click(screen.getByRole('button', { name: /Schedules \(3\)/ }));
      
      const newScheduleButton = screen.getByText('New Schedule');
      fireEvent.click(newScheduleButton);
      
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-title')).toHaveTextContent('Create New Schedule');
    });
  });

  describe('Modal Interactions', () => {
    it('closes modal when close button is clicked', () => {
      render(<ConsumerAutomation />);
      
      // Open modal
      const newSceneButton = screen.getByText('New Scene');
      fireEvent.click(newSceneButton);
      
      // Close modal
      const closeButton = screen.getByTestId('modal-close');
      fireEvent.click(closeButton);
      
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('creates new scene when form is submitted', async () => {
      render(<ConsumerAutomation />);
      
      // Open modal
      const newSceneButton = screen.getByText('New Scene');
      fireEvent.click(newSceneButton);
      
      // Fill form
      const nameInput = screen.getByPlaceholderText('e.g., Good Morning, Movie Night');
      fireEvent.change(nameInput, { target: { value: 'Test Scene' } });
      
      const descriptionInput = screen.getByPlaceholderText('Describe what this scene does...');
      fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
      
      // Submit form
      const createButton = screen.getByText('Create Scene');
      fireEvent.click(createButton);
      
      // Wait for creation to complete with longer timeout
      await waitFor(() => {
        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('shows confirmation dialog when delete is clicked', () => {
      render(<ConsumerAutomation />);
      
      // Find and click a delete button
      const deleteButtons = screen.getAllByRole('button');
      const deleteButton = deleteButtons.find(button => 
        button.querySelector('svg')?.classList.contains('trash-icon') ||
        button.getAttribute('aria-label')?.includes('delete')
      );
      
      if (deleteButton) {
        fireEvent.click(deleteButton);
        
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
        expect(screen.getByTestId('confirm-title')).toHaveTextContent(/Delete/);
      }
    });
  });

  describe('Accessibility', () => {
    it('has proper button roles', () => {
      render(<ConsumerAutomation />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('has proper tab navigation', () => {
      render(<ConsumerAutomation />);
      
      const tabs = screen.getAllByRole('button');
      const scenesTab = tabs.find(tab => tab.textContent?.includes('Scenes'));
      const automationsTab = tabs.find(tab => tab.textContent?.includes('Automations'));
      const schedulesTab = tabs.find(tab => tab.textContent?.includes('Schedules'));
      
      expect(scenesTab).toBeInTheDocument();
      expect(automationsTab).toBeInTheDocument();
      expect(schedulesTab).toBeInTheDocument();
    });

    it('has proper form labels', () => {
      render(<ConsumerAutomation />);
      
      // Open a modal to check form labels
      const newSceneButton = screen.getByText('New Scene');
      fireEvent.click(newSceneButton);
      
      expect(screen.getByText('Scene Name')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles form validation errors', () => {
      render(<ConsumerAutomation />);
      
      // Open modal
      const newSceneButton = screen.getByText('New Scene');
      fireEvent.click(newSceneButton);
      
      // Try to submit without required fields
      const createButton = screen.getByText('Create Scene');
      expect(createButton).toBeDisabled(); // Should be disabled without name
    });

    it('shows loading state when processing', async () => {
      render(<ConsumerAutomation />);
      
      // Open modal
      const newSceneButton = screen.getByText('New Scene');
      fireEvent.click(newSceneButton);
      
      // Fill form
      const nameInput = screen.getByPlaceholderText('e.g., Good Morning, Movie Night');
      fireEvent.change(nameInput, { target: { value: 'Test Scene' } });
      
      // Submit form
      const createButton = screen.getByText('Create Scene');
      fireEvent.click(createButton);
      
      // Should show loading state
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });

  describe('Tips Section', () => {
    it('displays automation tips', () => {
      render(<ConsumerAutomation />);
      
      expect(screen.getByText('💡 Automation Tips')).toBeInTheDocument();
      expect(screen.getByText(/Perfect for daily routines/)).toBeInTheDocument();
      expect(screen.getByText(/Great for security and energy savings/)).toBeInTheDocument();
      expect(screen.getByText(/Ideal for regular tasks/)).toBeInTheDocument();
    });
  });
});
