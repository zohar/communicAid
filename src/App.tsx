import { useState } from 'react';
import { Header } from './components/Header';
import { ActionBar } from './components/ActionBar';
import { RecentItems } from './components/RecentItems';
import { HomeScreen } from './components/screens/HomeScreen';
import { CategoryScreen } from './components/screens/CategoryScreen';
import { categories } from './data/categories';
import { Category, RecentItem, QuickName } from './types';
import { useLanguage } from './hooks/useLanguage';

type NavigationState = {
  screen: 'home' | 'category';
  category?: Category;
  breadcrumb: string[];
};

function App() {
  useLanguage(); // Sets dir and lang attributes on <html>

  const [navigation, setNavigation] = useState<NavigationState>({
    screen: 'home',
    breadcrumb: ['Home'],
  });

  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [quickNames] = useState<QuickName[]>([
    { id: '1', name: 'Nurse', icon: '👩‍⚕️', position: 1 },
    { id: '2', name: 'Mum', icon: '👩', position: 2 },
    { id: '3', name: 'Dad', icon: '👨', position: 3 },
    { id: '4', name: 'Doctor', icon: '👨‍⚕️', position: 4 },
  ]);

  const [selectedMessage, setSelectedMessage] = useState<string>('');

  const handleItemTap = (text: string, icon: string) => {
    const newItem: RecentItem = {
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
      breadcrumb: [...navigation.breadcrumb, category.name],
    });
  };

  const handleSubcategorySelect = (subcategory: Category) => {
    setNavigation({
      screen: 'category',
      category: subcategory,
      breadcrumb: [...navigation.breadcrumb, subcategory.name],
    });
  };

  const handleBack = () => {
    if (navigation.breadcrumb.length > 1) {
      const newBreadcrumb = navigation.breadcrumb.slice(0, -1);
      const lastCrumb = newBreadcrumb[newBreadcrumb.length - 1];

      if (lastCrumb === 'Home') {
        setNavigation({
          screen: 'home',
          breadcrumb: newBreadcrumb,
        });
      } else {
        const parentCategory = categories.find((c) => c.name === lastCrumb);
        if (parentCategory) {
          setNavigation({
            screen: 'category',
            category: parentCategory,
            breadcrumb: newBreadcrumb,
          });
        }
      }
    }
  };

  const handleHome = () => {
    setNavigation({
      screen: 'home',
      breadcrumb: ['Home'],
    });
  };

  const currentTitle = navigation.breadcrumb[navigation.breadcrumb.length - 1];

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col">
      <Header
        title={currentTitle}
        onBack={navigation.breadcrumb.length > 1 ? handleBack : undefined}
        onHome={handleHome}
      />

      {selectedMessage && (
        <div className="bg-green-500 text-white text-center py-6 px-4 shadow-lg border-b-4 border-green-600">
          <p className="text-4xl font-bold">{selectedMessage}</p>
        </div>
      )}

      <div className="flex-1 overflow-auto p-6">
        <RecentItems items={recentItems} onItemTap={handleItemTap} />

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
      </div>

      <ActionBar quickNames={quickNames} onItemTap={handleItemTap} />
    </div>
  );
}

export default App;
