import { Input } from '@/src/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Textarea } from '@/src/components/ui/textarea';
import React, { JSX } from 'react';
import { IconComponent, LoadingDialog } from './MainSectionComponents';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/src/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { AlertTriangle, Loader2, Plus, Save, Trash2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/src/components/ui/dialog';
import { AlertDialogHeader } from '@/src/components/ui/alert-dialog';
import { SimpleImageUploader } from '../app/dashboard/services/addService/Utils/Image-uploader';

interface FieldConfig {
  type: 'input' | 'textarea' | 'select' | 'image' | 'featureImage';
  name: string;
  label: string;
  placeholder?: string;
  options?: string[];
  minHeight?: string;
  hidden?: boolean;
  onChange?: (value: any, props: DynamicSectionManagerProps, index?: number) => void;
}

interface RepeatableConfig {
  fields: FieldConfig[];
  title: (index: number) => string;
  addButtonText: string;
}

interface SectionConfig {
  fields?: FieldConfig[];
  repeatable?: RepeatableConfig;
  sharedFields?: FieldConfig[];
}

interface ValidationError {
  isOpen: boolean;
  counts: { language: string; count: number }[];
}

interface DynamicSectionManagerProps {
  sectionType: 'hero' | 'process' | 'features' | 'benefits';
  isSaving: boolean;
  isLoadingData: boolean;
  isLoadingSubsection: boolean;
  dataLoaded?: boolean;
  existingSubSectionId?: string;
  languageIds: string[];
  languageCodes: Record<string, string>;
  form: any;
  validationError?: ValidationError;
  onSave: () => void;
  onValidationDialogToggle: (isOpen: boolean) => void;
  onAddItem?: (langCode: string, index?: number) => void;
  onRemoveItem?: (langCode: string, index: number, subIndex?: number) => void;
  availableIcons?: string[];
  updateIconAcrossLanguages?: (index: number, value: string) => void;
}

const sectionConfigs: Record<string, SectionConfig> = {
  hero: {
    sharedFields: [
      {
        type: 'image',
        name: 'backgroundImage',
        label: 'Background Image',
        placeholder: 'Upload a background image',
      },
    ],
    fields: [
      { type: 'input', name: 'title', label: 'Title', placeholder: 'Enter title' },
      { type: 'textarea', name: 'description', label: 'Description', placeholder: 'Enter description', minHeight: '100px' },
      { type: 'input', name: 'backLinkText', label: 'Button Text', placeholder: 'Get Started' },
    ],
  },
  process: {
    repeatable: {
      fields: [
        {
          type: 'select',
          name: 'icon',
          label: 'Icon',
          placeholder: 'Select an icon',
          options: [
            'Car',
            'MonitorSmartphone',
            'Settings',
            'CreditCard',
            'Clock',
            'MessageSquare',
            'LineChart',
            'Headphones',
          ],
          onChange: (value, props, index) => {
            props.updateIconAcrossLanguages?.(index!, value);
          },
        },
        { type: 'input', name: 'title', label: 'Title', placeholder: 'Enter title' },
        { type: 'textarea', name: 'description', label: 'Description', placeholder: 'Enter description', minHeight: '80px' },
      ],
      title: (index) => `Step ${index + 1}`,
      addButtonText: 'Add Process Step',
    },
  },
  features: {
    repeatable: {
      fields: [
        { type: 'input', name: 'id', label: 'ID', placeholder: 'feature-id', hidden: true },
        { type: 'input', name: 'title', label: 'Title', placeholder: 'Feature title' },
        { type: 'input', name: 'content.heading', label: 'Heading', placeholder: 'Feature heading' },
        { type: 'textarea', name: 'content.description', label: 'Description', placeholder: 'Feature description', minHeight: '100px' },
        {
          type: 'input',
          name: 'content.features',
          label: 'Feature List',
          placeholder: 'Feature item',
        },
        {
          type: 'featureImage',
          name: 'featureImage',
          label: 'Feature Image',
          placeholder: 'Upload feature image',
        },
      ],
      title: (index) => `Feature ${index + 1}`,
      addButtonText: 'Add Feature',
    },
  },
  benefits: {
    repeatable: {
      fields: [
        {
          type: 'select',
          name: 'icon',
          label: 'Icon',
          placeholder: 'Select an icon',
          options: [
            'Car',
            'MonitorSmartphone',
            'Settings',
            'CreditCard',
            'Clock',
            'MessageSquare',
            'LineChart',
            'Headphones',
          ],
        },
        { type: 'input', name: 'title', label: 'Title', placeholder: 'Enter title' },
        { type: 'textarea', name: 'description', label: 'Description', placeholder: 'Enter description', minHeight: '80px' },
      ],
      title: (index) => `Benefit ${index + 1}`,
      addButtonText: 'Add Benefit',
    },
  },
};

const DynamicSectionManager: React.FC<DynamicSectionManagerProps> = ({
  sectionType,
  isSaving,
  isLoadingData,
  isLoadingSubsection,
  dataLoaded,
  existingSubSectionId,
  languageIds,
  languageCodes,
  form,
  validationError,
  onSave,
  onValidationDialogToggle,
  onAddItem,
  onRemoveItem,
  availableIcons,
  updateIconAcrossLanguages,
}) => {
  const config = sectionConfigs[sectionType];
  const sectionTitle = sectionType.charAt(0).toUpperCase() + sectionType.slice(1) + ' Section';
  const actionVerb = existingSubSectionId ? 'Updating' : 'Creating';

  const renderField = (field: FieldConfig, fieldName: string, langCode: string, index?: number) => {
    return (
      <FormField
        key={fieldName}
        control={form.control}
        name={fieldName}
        render={({ field: formField }) => {
          let fieldComponent: JSX.Element | null = null;

          if (field.type === 'input') {
            fieldComponent = (
              <Input
                placeholder={field.placeholder}
                {...formField}
                value={formField.value || ''}
                onChange={formField.onChange}
              />
            );
          } else if (field.type === 'textarea') {
            fieldComponent = (
              <Textarea
                placeholder={field.placeholder}
                className={`min-h-[${field.minHeight}]`}
                {...formField}
                value={formField.value || ''}
                onChange={formField.onChange}
              />
            );
          } else if (field.type === 'select') {
            fieldComponent = (
              <Select
                onValueChange={(value) => {
                  formField.onChange(value);
                  if (field.onChange && index !== undefined) {
                    field.onChange(value, { updateIconAcrossLanguages }, index);
                  }
                }}
                value={formField.value || undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder={field.placeholder}>
                    {formField.value && (
                      <span className="flex items-center">
                        <IconComponent iconName={formField.value} className="mr-2" />
                        {formField.value}
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(field.options || availableIcons || []).map((option) => (
                    <SelectItem key={option} value={option}>
                      <span className="flex items-center">
                        <IconComponent iconName={option} className="mr-2" />
                        {option}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          } else if (field.type === 'image') {
            fieldComponent = (
              <SimpleImageUploader
                imageValue={form.getValues()[field.name] || formField.value || ''}
                inputId={`file-upload-${field.name}`}
                onUpload={(file) => form.setValue(fieldName, file)}
                onRemove={() => form.setValue(fieldName, null)}
                altText={`${field.label} preview`}
              />
            );
          } else if (field.type === 'featureImage' && index !== undefined && langCode === languageIds[0]) {
            fieldComponent = <div>Feature Image Uploader Placeholder</div>;
          }

          if (!fieldComponent) return null;

          return (
            <FormItem className={field.hidden ? 'hidden' : ''}>
              <FormLabel>{field.label}</FormLabel>
              <FormControl>{fieldComponent}</FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    );
  };

  const renderRepeatableFields = (langCode: string, items: any[]) => {
    if (!config.repeatable) return null;

    return items.map((_, index) => (
      <Card key={index} className="border border-muted">
        <CardHeader className="p-4 flex flex-row items-center justify-between">
          <CardTitle className="text-base">{config?.repeatable?.title(index)}</CardTitle>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={() => onRemoveItem?.(langCode, index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-4">
          {config?.repeatable?.fields
            .filter((field) => field.name !== 'content.features')
            .map((field) => {
              const fieldName = `${langCode}.${index}.${field.name}`;
              return renderField(field, fieldName, langCode, index);
            })}
          {sectionType === 'features' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Feature List</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onAddItem?.(langCode, index)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Feature Item
                </Button>
              </div>
              {form.watch(`${langCode}.${index}.content.features`)?.map((_: any, subIndex: number) => (
                <FormField
                  key={subIndex}
                  control={form.control}
                  name={`${langCode}.${index}.content.features.${subIndex}`}
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <div className="flex-1">
                        <FormControl>
                          <Input placeholder={`Feature ${subIndex + 1}`} {...field} />
                        </FormControl>
                        <FormMessage />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveItem?.(langCode, index, subIndex)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    ));
  };

  return (
    <div className="space-y-6">
      <LoadingDialog
        isOpen={isSaving}
        title={`${actionVerb} ${sectionTitle}`}
        description="Please wait while we save your changes..."
      />

      {(isLoadingData || isLoadingSubsection) && (!dataLoaded || sectionType !== 'features') ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <p className="text-muted-foreground">Loading {sectionTitle.toLowerCase()} data...</p>
        </div>
      ) : (
        <Form {...form}>
          {config.sharedFields && (
            <div className="mb-6">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Shared {sectionTitle} Settings</CardTitle>
                  <CardDescription>Configure settings that apply to all languages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    {config.sharedFields.map((field) => renderField(field, field.name, '', undefined))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className={`grid grid-cols-1 ${sectionType === 'hero' ? 'md:grid-cols-2 lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6`}>
            {languageIds.map((langId) => {
              const langCode = languageCodes[langId] || langId;
              return (
                <Card key={langId} className="w-full">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <span className="uppercase font-bold text-sm bg-primary text-primary-foreground rounded-md px-2 py-1 mr-2">
                        {langCode}
                      </span>
                      {sectionTitle}
                    </CardTitle>
                    <CardDescription>Manage {sectionTitle.toLowerCase()} content for {langCode.toUpperCase()}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {config.fields &&
                      config.fields.map((field) => {
                        const fieldName = `${langCode}.${field.name}`;
                        return renderField(field, fieldName, langCode, undefined);
                      })}
                    {config.repeatable && renderRepeatableFields(langCode, form.watch(langCode) || [])}
                    {config.repeatable && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onAddItem?.(langCode)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {config.repeatable.addButtonText}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </Form>
      )}

      <div className="flex justify-end mt-6">
        {validationError && validationError.counts.length > 0 && (
          <div className="flex items-center text-amber-500 mr-4">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span className="text-sm">Each language must have the same number of items</span>
          </div>
        )}
        <Button
          type="button"
          onClick={onSave}
          disabled={isLoadingData || isSaving || (validationError && validationError.counts.length > 0)}
          className="flex items-center"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {existingSubSectionId ? `Update ${sectionTitle}` : `Save ${sectionTitle}`}
            </>
          )}
        </Button>
      </div>

      {validationError && (
        <Dialog open={validationError.isOpen} onOpenChange={onValidationDialogToggle}>
          <DialogContent>
            <AlertDialogHeader>
              <DialogTitle>Item Count Mismatch</DialogTitle>
              <DialogDescription>
                <div className="mt-4 mb-4">
                  Each language must have the same number of items before saving. Please add or remove items to ensure all languages have the same count:
                </div>
                <ul className="list-disc pl-6 space-y-1">
                  {validationError.counts.map(({ language, count }) => (
                    <li key={language}>
                      <span className="font-semibold uppercase">{language}</span>: {count} items
                    </li>
                  ))}
                </ul>
              </DialogDescription>
            </AlertDialogHeader>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => onValidationDialogToggle(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DynamicSectionManager;