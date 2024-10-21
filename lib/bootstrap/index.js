import roles from './roles';
import superAdminUsers from './super-admin-users';
import {Otp, Role, User, UserRole} from '../../models';
import {SYSTEM_ROLES} from '../../utils/constants';
import {asyncForEach} from '../../utils/utilityFunctions';
import bcrypt from "bcryptjs"

async function BootstrapData() {
    // create roles
    try {
        await Role.bulkCreate([...roles.map((role) => {
            return {name: role}
        })])
    } catch (err) {
    }

    // create super admin users
    try {
        console.log('Creating super admin users.......')
        const role = await Role.findOne({
            name: SYSTEM_ROLES.SUPER_ADMIN
        })
        await asyncForEach(superAdminUsers, async (sa) => {
            try {
                let password = await bcrypt.hash(sa.password, 10);
                sa.password = password
                console.log(password)
                const user = await User.create(sa)
                console.log(user )
                // await UserRole.create({
                //     UserId: user.id,
                //     RoleId: role.id,
                // })
                const otp = new Otp({mobile: user.mobile, otp: password })
                await otp.save();
            } catch (err) {
                console.log(err)
            }
        })
    } catch (err) {
       
    }
}

export default BootstrapData;