import { JsonWebToken, Token } from '../../lib/authentication';
import { Otp, Role, Sequelize,sequelize,SettlementDetails,Fulfillment,Item, User, Issue,Provider,UserRole,Order,Seller} from '../../models';
import BadRequestParameterError from '../../lib/errors/bad-request-parameter.error';
import Mailer from '../../lib/mailer';
import UnauthenticatedError from "../../lib/errors/unauthenticated.error";
import MESSAGES from "../../utils/messages";
const Op = Sequelize.Op;
const otpGenerator = require('otp-generator')
class AuthenticationService {

    async loginWithOTP(params) {
        try {
            console.log("params--->", params)
            const email = params.email || null
            const mobile = params.mobile || null

            let query = {};

            if(mobile){
                query = {mobile}
            }else{
                query = {email}
            }
            const user = await User.findOne(
                {
                    where: query,
                    include: [{model: Role}]
                },
            );

            if (!user) {
                if (mobile) {
                    throw new UnauthenticatedError(MESSAGES.LOGIN_ERROR_INVALID_MOBILE);
                } else {
                    throw new UnauthenticatedError(MESSAGES.INVALID_EMAIL_ADDRESS);
                }
            }

            if(!user.enabled){
                throw new UnauthenticatedError(MESSAGES.LOGIN_ERROR_USER_ACCOUNT_DEACTIVATED)
            }

            if(!user){
                throw new UnauthenticatedError(MESSAGES.LOGIN_ERROR_USER_SESSION_OVERRIDE)
            }

            if (user) {

                let OTP = ''
                // if(mobile==='8796105046'){
                OTP ='123456'
                // }else{
                //     OTP = otpGenerator.generate(6, {
                //         digits: true,
                //         lowerCaseAlphabets: false,
                //         upperCaseAlphabets: false,
                //         specialChars: false
                //     })
                // }


                console.log(OTP)
               // const OTP = '123456';

                let expiry = new Date();
                expiry.setMinutes(expiry.getMinutes() + parseInt(process.env.SMS_CONFIG_OTP_EXPIRY_DURATION, 10));

                await Otp.destroy({where: {mobile: mobile || user.mobile}})

                const otp = new Otp({mobile: mobile || user.mobile, otp: OTP})
                await otp.save();
                // 3: Send an email with a temporary password
                // const mailer = new Mailer(sender);

            }
            return 
        } catch (err) {
            throw err
        }
    }

    async verifyOTP(data) {
        const email = data.email || null
        const mobile = data.mobile || null
        const otp = data.password
        try {
            let query = {}
            if (mobile) {
                query.mobile = mobile;
            } else {
                query.email = email; //TODO: lower case in login and verify & user create
            }
            const user = await User.findOne({
                where: query,
            });

            if (!user) {
                throw new UnauthenticatedError(MESSAGES.INVALID_EMAIL_ADDRESS);
            }


            if (!user.enabled) {
                throw new UnauthenticatedError(MESSAGES.LOGIN_ERROR_USER_ACCOUNT_DEACTIVATED)
            }

            const otpObj = await Otp.findOne({ where: { mobile: mobile || user.mobile } })
            if (otpObj.otp === otp) {
                // const user = await User.findOne({
                //   where: {
                //     [Op.or]: [{ email }]
                //   }
                // });
                const tokenRes = await this.createAccessToken(user.id)
                return tokenRes
            } else {
                throw new UnauthenticatedError(MESSAGES.LOGIN_ERROR_USER_SESSION_OVERRIDE)
            }
        } catch (err) {
            console.log('-------------------------------------', err)
            throw err;
        }
    }

    async dumpData(data) {
        const transaction = await sequelize.transaction();
        try {
            // Fetch orders from MongoDB
            for (let order of data) {
                if (order.id) {
                    let newSeller;
                    try {

                       //load seller first
                       let seller = await Seller.findOne({where:{bpp_id:order.bppId}})

                        console.log("seller exists---->",seller)
                        if(!seller){


                            let bpp_term = order?.tags?.find(x => x.code === 'bpp_terms')

                            let tax_number = bpp_term?.list?.find(x => x.code === 'tax_number')
                            let pan_number = bpp_term?.list?.find(x => x.code === 'provider_tax_number')


                            console.log("seller not exists---->")
                            //create seller
                          seller= await new Seller({
                              bpp_id: order.bppId,
                              name: order.bppId,
                              gst:tax_number?.value,
                              pan:pan_number?.value

                          }).save({transaction});
                        }

                        //load provider

                        let provider = await Provider.findOne({where:{name:order.provider.descriptor.name,SellerId:seller.id}})

                        if(!provider){
                            provider= await new Provider({
                                SellerId: seller.id,
                                name: order.provider.descriptor.name
                            }).save({transaction});
                        }
                        //set settlement details
                        let settlementDetails = await SettlementDetails.findOne({where:{SellerId:seller.id}})

                        console.log("order.settlementDetails['@ondc/org/settlement_details']", order.settlementDetails['@ondc/org/settlement_details'])
                        console.log("order.settlementDetails['@ondc/org/settlement_details'--]",order.settlementDetails['@ondc/org/settlement_details'].settlement_type)
                        if(!settlementDetails){
                            await new SettlementDetails({
                                settlementType:order.settlementDetails['@ondc/org/settlement_details'][0].settlement_type,
                                accountNo:order.settlementDetails['@ondc/org/settlement_details'][0].settlement_type,
                                beneficiary_name:order.settlementDetails['@ondc/org/settlement_details'][0].beneficiary_name,
                                UPI:order.settlementDetails['@ondc/org/settlement_details'][0].upi_address,
                                settlement_bank_account_no:order.settlementDetails['@ondc/org/settlement_details'][0].settlement_bank_account_no,
                                settlement_ifsc_code:order.settlementDetails['@ondc/org/settlement_details'][0].settlement_ifsc_code,
                                bankName:order.settlementDetails['@ondc/org/settlement_details'][0].bank_name,
                                branchName:order.settlementDetails['@ondc/org/settlement_details'][0].branch_name,
                                SellerId:seller.id
                            }).save({transaction});
                        }

                       //find if order is there
                       let orderObj = await Order.findOne({where:{orderId:order.id}});
                        if(orderObj){

                            let deliveryFulfillment = order.fulfillments.find(x => x.type === 'Delivery')
                            let city = deliveryFulfillment.end.location.address.city
                            let areaCode = deliveryFulfillment.end.location.address.area_code
                            //update
                            let savedOrder = await Order.update({ orderId:order.id,
                                currency: order.quote?.price?.currency ?? 'INR',
                                value:parseFloat(order.quote?.price?.value ?? '0'),
                                bff:parseFloat(order.settlementDetails?.['@ondc/org/buyer_app_finder_fee_amount'] ?? '0')*parseFloat(order.quote?.price?.value ?? '0')/100,
                                collectedBy:order.settlementDetails?.['@ondc/org/settlement_details'][0].settlement_counterparty ?? 'NA',
                                paymentType:order.payment?.type  ?? 'NA',
                                state:order.state ?? 'NA',
                                SellerId:seller.id,ProviderId: provider.id,
                                city:city,
                                areaCode:areaCode,
                                domain:order.domain,
                                paymentStatus:order.payment?.status,
                                settlement:order.settlementDetails,
                                finalValue:parseFloat(order.quote?.price?.value ?? '0')

                            },{where:{orderId:order.id}},{transaction})

                            for(let fulfillment of order.fulfillments){

                                let oldFl = await Fulfillment.findOne({
                                    fulfillmentId:fulfillment.id,
                                    OrderId:orderObj.id
                                });

                                if(oldFl){
                                    //update
                                     await Fulfillment.update({
                                        fulfillmentId:fulfillment.id,
                                        fulfillmentState:fulfillment.state.descriptor.code,
                                        fulfillmentType:fulfillment.type,
                                        details:fulfillment,
                                        OrderId:orderObj.id
                                    },{where:{OrderId:orderObj.id,fulfillmentId:fulfillment.id}},{transaction});

                                }else{
                                    let fl = await new Fulfillment({
                                        fulfillmentId:fulfillment.id,
                                        fulfillmentState:fulfillment.state.descriptor.code,
                                        fulfillmentType:fulfillment.type,
                                        details:fulfillment,
                                        OrderId:orderObj.id
                                    }).save({transaction});
                                }

                            }
                            for(let item of order.items){

                                let oldSavedItems = await Item.findOne({where:{
                                        itemId:item.id,
                                        fulfillmentId:item.fulfillment_id,
                                        OrderId:orderObj.id
                                    }})
                                if(oldSavedItems){
                                    let itm = await Item.update({
                                        itemId:item.id,
                                        fulfillmentId:item.fulfillment_id,
                                        quantity:item.quantity.count,
                                        itemName:item.product.descriptor.name,
                                        OrderId:orderObj.id
                                    },{where:{OrderId:orderObj.id, itemId:item.id,fulfillmentId:item.fulfillment_id}},{transaction})
                                }else{
                                    let itm = await new Item({
                                        itemId:item.id,
                                        fulfillmentId:item.fulfillment_id,
                                        quantity:item.quantity.count,
                                        itemName:item.product.descriptor.name,
                                        OrderId:orderObj.id
                                    }).save({transaction});
                                }

                            }

                            for(let issue of order.issues){

                                let oldSavedIssue = await Issue.findOne({where:{
                                        issueId:issue.issueId,
                                        OrderId:orderObj.id
                                    }});

                                if(oldSavedIssue){
                                    let itm = await Issue.update({
                                        issueId:issue.issueId,
                                        OrderId:orderObj.id,
                                        category:issue.category,
                                        subCategory:issue.sub_category,
                                        complainant:issue?.complainant_info?.person?.name??"NA",
                                        issueStatus:issue.issue_status,
                                        // respondent: TODO: to be discussed
                                        createdAt:issue.createdAt
                                    },{where:{OrderId:orderObj.id,  issueId:issue.issueId}},{transaction})
                                }else{
                                    let itm = await new Issue({
                                        issueId:issue.issueId,
                                        OrderId:orderObj.id,
                                        category:issue.category,
                                        subCategory:issue.sub_category,
                                        complainant:issue?.complainant_info?.person?.name??"NA",
                                        issueStatus:issue.issue_status,
                                        createdAt:issue.createdAt
                                    }).save({transaction});
                                }

                            }

                            await  transaction.commit()

                        }else{
                            //create
                            //TODO: @ondc/org/buyer_app_finder_fee_type
                            let deliveryFulfillment = order.fulfillments.find(x => x.type === 'Delivery')
                            let city = deliveryFulfillment.end.location.address.city
                            let areaCode = deliveryFulfillment.end.location.address.area_code
                           let savedOrder = await new Order({
                                orderId:order.id,
                                currency: order.quote?.price?.currency ?? 'INR',
                                value:parseFloat(order.quote?.price?.value ?? '0'),
                                bff:parseFloat(order.settlementDetails?.['@ondc/org/buyer_app_finder_fee_amount'] ?? '0')*parseFloat(order.quote?.price?.value ?? '0')/100,
                                collectedBy:order.settlementDetails?.['@ondc/org/settlement_details'][0].settlement_counterparty ?? 'NA',
                                paymentType:order.payment?.type  ?? 'NA',
                                state:order.state ?? 'NA',
                                SellerId:seller.id,
                                createdAt:order.createdAt,
                                updatedAt:order.updatedAt,
                                ProviderId: provider.id,
                                city:city,
                                areaCode:areaCode,
                                domain:order.domain,
                                paymentStatus:order.payment?.status,
                                settlement:order.settlementDetails,
                                finalValue:parseFloat(order.quote?.price?.value ?? '0')
                            }).save({transaction})

                            for(let fulfillment of order.fulfillments){

                                let fl = await new Fulfillment({
                                    fulfillmentId:fulfillment.id,
                                    fulfillmentState:fulfillment.state.descriptor.code,
                                    fulfillmentType:fulfillment.type,
                                    details:fulfillment,
                                    OrderId:savedOrder.id
                                }).save({transaction});
                            }
                            for(let item of order.items){
                                let itm = await new Item({
                                    itemId:item.id,
                                    fulfillmentId:item.fulfillment_id,
                                    quantity:item.quantity.count,
                                    itemName:item.product.descriptor.name,
                                    OrderId:savedOrder.id

                                }).save({transaction});
                            }


                            for(let issue of order.issues){

                                let oldSavedIssue = await Issue.findOne({where:{
                                        issueId:issue.issueId,
                                        OrderId:savedOrder.id
                                    }});

                                if(oldSavedIssue){
                                    let itm = await Issue.update({
                                        issueId:issue.issueId,
                                        OrderId:savedOrder.id,
                                        category:issue.category,
                                        subCategory:issue.sub_category,
                                        complainant:issue?.complainant_info?.person?.name??"NA",
                                        issueStatus:issue.issue_status,
                                        createdAt:issue.createdAt
                                        // respondent: TODO: to be discussed

                                    },{where:{OrderId:savedOrder.id,  issueId:issue.issueId}},{transaction})
                                }else{
                                    let itm = await new Issue({
                                        issueId:issue.issueId,
                                        OrderId:savedOrder.id,
                                        category:issue.category,
                                        subCategory:issue.sub_category,
                                        complainant:issue?.complainant_info?.person?.name??"NA",
                                        issueStatus:issue.issue_status,
                                        createdAt:issue.createdAt

                                    }).save({transaction});
                                }

                            }

                            for(let item of order.items){

                                let oldSavedItems = await Item.findOne({where:{
                                        itemId:item.id,
                                        fulfillmentId:item.fulfillment_id,
                                        OrderId:savedOrder.id
                                    }})
                                if(oldSavedItems){
                                    let itm = await Item.update({
                                        itemId:item.id,
                                        fulfillmentId:item.fulfillment_id,
                                        quantity:item.quantity.count,
                                        itemName:item.product.descriptor.name,
                                        OrderId:savedOrder.id
                                    },{where:{OrderId:savedOrder.id, itemId:item.id,fulfillmentId:item.fulfillment_id}},{transaction})
                                }else{
                                    let itm = await new Item({
                                        itemId:item.id,
                                        fulfillmentId:item.fulfillment_id,
                                        quantity:item.quantity.count,
                                        itemName:item.product.descriptor.name,
                                        OrderId:savedOrder.id
                                    }).save({transaction});
                                }

                            }


                            await  transaction.commit()
                        }



                    } catch (err) {
                        //await transaction.rollback();
                        throw err
                    }
                }
            }

            return true
        } catch (error) {
            console.error('Error fetching orders:', error);
            await transaction.rollback();
            throw error
        }

    }

    async createAccessToken(userId) {
        let user = await User.findOne({
            where: {
                [Op.or]: [{id: userId}]
            },
            include:[{model:Role}]
        });

        // const orgUsers = await Organization.findAll({where:{},attributes:['id','name'],include:[{model:User,where:{id:userId},attributes:['id']}]});

        user=user.toJSON();


        //console.log("orgUser",orgUsers);
        const tokenPayload = {
            user,
        };

        // create token instance with payload and expiry
        const token = new Token(tokenPayload, parseInt(process.env.JWT_TOKEN_EXPIRY_IN_SEC, 10));
        // create JWT instance by giving secret or key
        const jwt = new JsonWebToken({secret: process.env.JWT_TOKEN_SECRET});
        // sign token using JWT secret key
        const signedToken = await jwt.sign(token);
        return {user, token: signedToken};
    }
}

module.exports = new AuthenticationService();
