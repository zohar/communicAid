import { lazy, Suspense, useState } from 'react';
import { Header } from './components/Header';
import { ActionBar } from './components/ActionBar';
import { RecentItems } from './components/RecentItems';
import { HomeScreen } from './components/screens/HomeScreen';
import { CategoryScreen } from './components/screens/CategoryScreen';
import { ConfigScreen } from './components/screens/ConfigScreen';
import { categories } from './data/categories';
import { Category, RecentItem } from './types';
import { useLanguage } from './hooks/useLanguage';
import { useTranslation } from './hooks/useTranslation';
import { useQuickNames } from './hooks/useQuickNames';

const KeyboardScreen = lazy(
  () => import('./components/screens/KeyboardScreen'),
);

type NavigationState = {
  screen: 'home' | 'category' | 'config';
  category?: Category;
  breadcrumbIds: string[];
};

function App() {
  useLanguage(); // Sets dir and lang attributes on <html>
  const { t } = useTranslation();

  const [navigation, setNavigation] = useState<NavigationState>({
    screen: 'home',
    breadcrumbIds: ['home'],
  });

  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const { quickNames } = useQuickNames();

  const [selectedMessage, setSelectedMessage] = useState<string>('');

  const [keyboardOpen, setKeyboardOpen] = useState<boolean>(false);
  const handleKeyboard = () => setKeyboardOpen(true);
  const handleKeyboardClose = () => setKeyboardOpen(false);

  const handleItemTap = (text: string, icon: string, entryId?: string) => {
    const newItem: RecentItem = {
      entryId,
      text,
      icon,
      tappedAt: new Date(),
    };
    setRecentItems([newItem, ...recentItems]);

    setSelectedMessage(`${icon} ${text}`);
    setTimeout(() => setSelectedMessage(''), 3000);
  };

  const handleCategorySelect = (category: Category) => {
    setNavigation({
      screen: 'category',
      category,
      breadcrumbIds: [...navigation.breadcrumbIds, category.id],
    });
  };

  const handleSubcategorySelect = (subcategory: Category) => {
    setNavigation({
      screen: 'category',
      category: subcategory,
      breadcrumbIds: [...navigation.breadcrumbIds, subcategory.id],
    });
  };

  const handleBack = () => {
    if (navigation.breadcrumbIds.length > 1) {
      const newBreadcrumbIds = navigation.breadcrumbIds.slice(0, -1);
      const lastId = newBreadcrumbIds[newBreadcrumbIds.length - 1];

      if (lastId === 'home') {
        setNavigation({
          screen: 'home',
          breadcrumbIds: newBreadcrumbIds,
        });
      } else {
        const parentCategory = categories.find((c) => c.id === lastId);
        if (parentCategory) {
          setNavigation({
            screen: 'category',
            category: parentCategory,
            breadcrumbIds: newBreadcrumbIds,
          });
        }
      }
    }
  };

  const handleHome = () => {
    setNavigation({
      screen: 'home',
      breadcrumbIds: ['home'],
    });
  };

  const handleSettings = () => {
    setNavigation({
      screen: 'config',
      breadcrumbIds: [...navigation.breadcrumbIds, 'settings'],
    });
  };

  const currentTitleId = navigation.breadcrumbIds[navigation.breadcrumbIds.length - 1];
  const currentTitle = t(currentTitleId);

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col">
      <Header
        title={currentTitle}
        onBack={navigation.breadcrumbIds.length > 1 ? handleBack : undefined}
        onHome={handleHome}
        onSettings={handleSettings}
        onKeyboard={handleKeyboard}
      />

      {selectedMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white text-center py-4 px-8 shadow-2xl rounded-2xl border-4 border-green-600 pointer-events-none">
          <p className="text-4xl font-bold">{selectedMessage}</p>
        </div>
      )}

      <div className="flex-1 overflow-auto p-6">
        {navigation.screen === 'home' && (
          <HomeScreen categories={categories} onCategorySelect={handleCategorySelect} />
        )}

        {navigation.screen === 'category' && navigation.category && (
          <CategoryScreen
            category={navigation.category}
            onItemTap={handleItemTap}
            onSubcategorySelect={handleSubcategorySelect}
          />
        )}

        {navigation.screen === 'config' && (
          <ConfigScreen
            categories={categories}
            onCategoryEdit={() => {}}
          />
        )}
      </div>

      <ActionBar quickNames={quickNames} onItemTap={handleItemTap} />
      <RecentItems items={recentItems} onItemTap={handleItemTap} />

      <Suspense fallback={null}>
        {keyboardOpen && <KeyboardScreen onClose={handleKeyboardClose} />}
      </Suspense>
    </div>
  );
}

export default App;
