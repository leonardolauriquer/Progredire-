"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const campaigns_service_1 = require("./campaigns.service");
describe('CampaignsService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [campaigns_service_1.CampaignsService],
        }).compile();
        service = module.get(campaigns_service_1.CampaignsService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=campaigns.service.spec.js.map