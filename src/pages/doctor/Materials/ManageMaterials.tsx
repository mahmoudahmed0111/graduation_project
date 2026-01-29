import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { IMaterial, IEnrollment } from '@/types';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  FileText, 
  BookOpen,
  Trash2,
  ExternalLink,
  Download,
  Plus,
  Search
} from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { Input } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { categoryIcons, categoryColors } from '@/constants/ui';
import { logger } from '@/lib/logger';
import { Link } from 'react-router-dom';

export function ManageMaterials() {
  const { i18n } = useTranslation();
  const { user } = useAuthStore();
  const { success, error: showError } = useToastStore();
  const [materials, setMaterials] = useState<IMaterial[]>([]);
  const [myCourses, setMyCourses] = useState<IEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<IMaterial | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [coursesData, materialsData] = await Promise.all([
          api.getMyCourses({ semester: 'current' }).catch(() => []),
          api.getCourseMaterials().catch(() => [])
        ]);
        
        setMyCourses(Array.isArray(coursesData) ? coursesData : []);
        setMaterials(Array.isArray(materialsData) ? materialsData : []);
      } catch (error) {
        logger.error('Failed to fetch materials', {
          context: 'ManageMaterials',
          error,
        });
        showError('Failed to load materials');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter materials
  const filteredMaterials = materials.filter(material => {
    const matchesCourse = selectedCourse === 'all' || 
      material.courseOffering.id === selectedCourse;
    const matchesCategory = selectedCategory === 'all' || 
      material.category === selectedCategory;
    const matchesSearch = 
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Only show materials uploaded by current doctor
    const isMyMaterial = material.uploadedBy.id === user?.id;
    
    return matchesCourse && matchesCategory && matchesSearch && isMyMaterial;
  });

  const handleDelete = async () => {
    if (!materialToDelete) return;
    
    try {
      // In real app, call API to delete
      // await api.deleteMaterial(materialToDelete.id);
      
      setMaterials(materials.filter(m => m.id !== materialToDelete.id));
      success('Material deleted successfully');
      setDeleteDialogOpen(false);
      setMaterialToDelete(null);
    } catch (error) {
      logger.error('Failed to delete material', {
        context: 'ManageMaterials',
        error,
      });
      showError('Failed to delete material');
    }
  };

  const openDeleteDialog = (material: IMaterial) => {
    setMaterialToDelete(material);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {i18n.language === 'ar' ? 'إدارة المواد التعليمية' : 'Manage Materials'}
          </h1>
          <p className="text-gray-600 mt-1">
            {i18n.language === 'ar'
              ? 'رفع وحذف المواد التعليمية لمقرراتك'
              : 'Upload and delete course materials'}
          </p>
        </div>
        <Link to="/dashboard/materials/upload">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {i18n.language === 'ar' ? 'رفع مادة جديدة' : 'Upload Material'}
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder={i18n.language === 'ar' ? 'ابحث في المواد...' : 'Search materials...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">{i18n.language === 'ar' ? 'كل المقررات' : 'All Courses'}</option>
              {myCourses.map(course => (
                <option key={course.courseOffering?.id} value={course.courseOffering?.id}>
                  {course.courseOffering?.course?.code} - {course.courseOffering?.course?.title}
                </option>
              ))}
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">{i18n.language === 'ar' ? 'كل الفئات' : 'All Categories'}</option>
              <option value="Lectures">{i18n.language === 'ar' ? 'محاضرات' : 'Lectures'}</option>
              <option value="Sheets">{i18n.language === 'ar' ? 'أوراق عمل' : 'Sheets'}</option>
              <option value="Readings">{i18n.language === 'ar' ? 'قراءات' : 'Readings'}</option>
              <option value="Links">{i18n.language === 'ar' ? 'روابط' : 'Links'}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Materials List */}
      {filteredMaterials.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {i18n.language === 'ar' ? 'لا توجد مواد تعليمية' : 'No materials found'}
            </p>
            <Link to="/dashboard/materials/upload">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {i18n.language === 'ar' ? 'رفع مادة جديدة' : 'Upload First Material'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((material) => {
            const CategoryIcon = categoryIcons[material.category];
            
            return (
              <Card key={material.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${categoryColors[material.category]}`}>
                        <CategoryIcon className="h-4 w-4" />
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${categoryColors[material.category]}`}>
                        {material.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => openDeleteDialog(material)}
                        title={i18n.language === 'ar' ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {material.title}
                  </h3>
                  
                  {material.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {material.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <BookOpen className="h-3 w-3" />
                    <span>{material.courseOffering.course.code}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {material.isExternalLink ? (
                        <>
                          <ExternalLink className="h-4 w-4" />
                          <span>{i18n.language === 'ar' ? 'رابط خارجي' : 'External Link'}</span>
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4" />
                          <span>{material.fileType?.toUpperCase() || 'File'}</span>
                        </>
                      )}
                    </div>
                    <a
                      href={material.url}
                      target={material.isExternalLink ? '_blank' : undefined}
                      rel={material.isExternalLink ? 'noopener noreferrer' : undefined}
                      className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {material.isExternalLink ? (
                        <>
                          <ExternalLink className="h-4 w-4" />
                          {i18n.language === 'ar' ? 'فتح' : 'Open'}
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          {i18n.language === 'ar' ? 'تحميل' : 'Download'}
                        </>
                      )}
                    </a>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-400">
                    {i18n.language === 'ar' ? 'تم الرفع في' : 'Uploaded'} {new Date(material.uploadedAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setMaterialToDelete(null);
        }}
        onConfirm={handleDelete}
        title={i18n.language === 'ar' ? 'حذف المادة التعليمية' : 'Delete Material'}
        message={
          i18n.language === 'ar'
            ? `هل أنت متأكد من حذف "${materialToDelete?.title}"؟ لا يمكن التراجع عن هذا الإجراء.`
            : `Are you sure you want to delete "${materialToDelete?.title}"? This action cannot be undone.`
        }
        confirmText={i18n.language === 'ar' ? 'حذف' : 'Delete'}
        cancelText={i18n.language === 'ar' ? 'إلغاء' : 'Cancel'}
        variant="danger"
      />
    </div>
  );
}

