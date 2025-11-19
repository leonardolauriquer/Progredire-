"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const campaigns_controller_1 = require("./campaigns.controller");
describe('CampaignsController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [campaigns_controller_1.CampaignsController],
        }).compile();
        controller = module.get(campaigns_controller_1.CampaignsController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=campaigns.controller.spec.js.map