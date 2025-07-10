import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMockStore } from '@/lib/test-utils';
import { Modal } from '../Modal';

describe('Modal Component', () => {
  const mockOnClose = jest.fn();
  const mockStore = createMockStore({
    auth: { user: null, isAuthenticated: false },
  });

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('should render modal when open', () => {
    render(
      <Provider store={mockStore}>
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div>Modal Content</div>
        </Modal>
      </Provider>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('should not render modal when closed', () => {
    render(
      <Provider store={mockStore}>
        <Modal isOpen={false} onClose={mockOnClose} title="Test Modal">
          <div>Modal Content</div>
        </Modal>
      </Provider>
    );

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('should call onClose when close button clicked', () => {
    render(
      <Provider store={mockStore}>
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div>Modal Content</div>
        </Modal>
      </Provider>
    );

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when escape key pressed', () => {
    render(
      <Provider store={mockStore}>
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div>Modal Content</div>
        </Modal>
      </Provider>
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should render with custom size', () => {
    render(
      <Provider store={mockStore}>
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" size="lg">
          <div>Modal Content</div>
        </Modal>
      </Provider>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    // Check if modal has appropriate size class (implementation specific)
  });
});
