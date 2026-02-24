// Shared Jest setup for this workspace.
process.env.EXPO_PUBLIC_API_BASE_URL ??= 'https://api.example.test';
process.env.EXPO_PUBLIC_SUPABASE_URL ??= 'https://supabase.example.test';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??= 'anon-test-key';

jest.mock('@react-native-async-storage/async-storage', () => {
  const store: Record<string, string> = {};
  const mock = {
    getItem: jest.fn(async (key: string) => (key in store ? store[key] : null)),
    setItem: jest.fn(async (key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn(async (key: string) => {
      delete store[key];
    }),
    clear: jest.fn(async () => {
      Object.keys(store).forEach((key) => delete store[key]);
    })
  };

  return {
    __esModule: true,
    default: mock,
    ...mock
  };
});
