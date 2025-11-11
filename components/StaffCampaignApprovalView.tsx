
import React, { useState, useEffect, useCallback } from 'react';
import { getCampaigns, approveCampaign } from '../services/dataService';
import { Campaign } from './dashboardMockData';
import { ClockIcon, ShieldCheckIcon } from './icons';

export const StaffCampaignApprovalView: React.FC = () => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCampaigns = useCallback(async () => {
        setIsLoading(true);
        const allCampaigns = await getCampaigns();
        setCampaigns(allCampaigns);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    const handleApprove = async (campaignId: number) => {
        await approveCampaign(campaignId);
        fetchCampaigns(); // Refresh the list
    };
    
    const pendingCampaigns = campaigns.filter(c => c.status === 'Pendente');
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Aprovação de Campanhas</h1>
                <p className="text-slate-600 mt-1">Gerencie as novas campanhas de diagnóstico pendentes de aprovação.</p>
            </div>

            <div className="bg-[--color-card] p-6 rounded-2xl shadow-lg border border-[--color-border]">
                <h2 className="text-xl font-semibold text-[--color-card-foreground] mb-4">
                    Campanhas Pendentes de Aprovação
                </h2>
                {isLoading ? <p>Carregando campanhas...</p> : pendingCampaigns.length > 0 ? (
                    <div className="space-y-4">
                        {pendingCampaigns.map(campaign => (
                            <div key={campaign.id} className="bg-[--color-muted] p-4 rounded-lg border border-[--color-border] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h3 className="font-bold text-[--color-card-foreground]">{campaign.name}</h3>
                                    <p className="text-sm text-[--color-card-muted-foreground] mt-1">
                                        Público: {campaign.targetAudience} | Período: {new Date(campaign.startDate).toLocaleDateString()} a {new Date(campaign.endDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleApprove(campaign.id)}
                                    className="flex-shrink-0 w-full sm:w-auto bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-green-700 text-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    <ShieldCheckIcon className="w-5 h-5"/>
                                    Aprovar
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-500">
                        <ShieldCheckIcon className="w-12 h-12 mx-auto text-slate-300 mb-2"/>
                        <p>Nenhuma campanha pendente no momento.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
