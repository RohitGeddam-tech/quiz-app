// Runs before every test file.
import '@testing-library/jest-dom/vitest'; // DOM matchers such as toBeDisabled() and toHaveFocus()
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Unmount after each test. Testing Library only does this automatically when Vitest globals are on.
afterEach(cleanup);
