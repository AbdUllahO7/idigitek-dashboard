import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/hooks/use-toast';
import { Section } from '@/src/api/types/hooks/section.types';
import apiClient from '@/src/lib/api-client'; // Adjust import based on your setup

const useUpdateOrder = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { toast } = useToast();

    const getUserPrefix = () => {
        const userId = user?.id || 'anonymous';
        return userId ? `user-${userId}` : 'anonymous';
    };

    const sectionsKey = ['sections', getUserPrefix()];
    const sectionKey = (id: string) => [...sectionsKey, id];
    const websiteSectionsKey = (websiteId: string) => [...sectionsKey, 'website', websiteId];
    const websiteSectionsCompleteKey = (websiteId: string) => [...websiteSectionsKey(websiteId), 'complete'];
    const allCompleteDataKey = ['sections', getUserPrefix(), 'complete'];

    return useMutation({
        mutationFn: async (sections: { id: string; order: number; websiteId: string }[]) => {
        try {
            const response = await apiClient.patch(`/sections/order`, sections);
            console.log('API response:', response); // Debug log to inspect response

            // Handle different response structures
            let updatedSections = response.data;

            // Check for nested data (e.g., response.data.sections)
            if (response.data?.sections && Array.isArray(response.data.sections)) {
            updatedSections = response.data.sections;
            } else if (response.data?.data && Array.isArray(response.data.data)) {
            updatedSections = response.data.data;
            } else if (!Array.isArray(updatedSections)) {
            throw new Error(`Expected an array of sections in the response, received: ${JSON.stringify(response.data)}`);
            }

            return updatedSections;
        } catch (error: any) {
            console.error('Error updating section orders:', error);
            let errorMessage = 'Failed to update section orders';

            if (error.message?.includes('Max retries reached')) {
            errorMessage = 'Unable to update section order due to high system load. Please try again later.';
            } else if (error.message?.includes('Order value')) {
            errorMessage = error.message;
            } else if (error.message?.includes('Section not found')) {
            errorMessage = 'One or more sections not found or do not belong to the specified website';
            } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error; // Handle backend error messages
            }

            throw new Error(errorMessage);
        }
        },
        onSuccess: (data: Section[]) => {
        if (Array.isArray(data)) {
            data.forEach((section: Section) => {
            if (section._id) {
                queryClient.setQueryData(sectionKey(section._id), section);
            }
            });
            queryClient.invalidateQueries({ queryKey: sectionsKey });
            queryClient.invalidateQueries({ queryKey: allCompleteDataKey });
            const websiteIds = [...new Set(data.map((section: Section) => section.WebSiteId.toString()))];
            websiteIds.forEach((websiteId) => {
            queryClient.invalidateQueries({ queryKey: websiteSectionsKey(websiteId) });
            queryClient.invalidateQueries({ queryKey: websiteSectionsCompleteKey(websiteId) });
            });
        } else {
            console.error('onSuccess: Expected data to be an array, received:', data);
            toast({
            title: 'Error',
            description: 'Invalid response format from server.',
            variant: 'destructive',
            });
        }
        },
        onError: (error: any) => {
        console.error('Mutation error:', error);
        toast({
            title: 'Error updating order',
            description: error.message || 'An error occurred while updating section order.',
            variant: 'destructive',
        });
        },
    });
};

export default useUpdateOrder;