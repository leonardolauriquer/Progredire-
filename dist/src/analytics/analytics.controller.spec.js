"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const analytics_controller_1 = require("./analytics.controller");
describe('AnalyticsController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [analytics_controller_1.AnalyticsController],
        }).compile();
        controller = module.get(analytics_controller_1.AnalyticsController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=analytics.controller.spec.js.map