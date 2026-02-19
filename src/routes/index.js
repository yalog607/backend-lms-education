import userRoute from './user.route.js'
import studentRoute from "./student.route.js"
import courseRoute from "./course.route.js"
import sectionRoute from "./section.route.js"
import lessonRoute from "./lesson.route.js"
import commentRoute from "./comment.route.js"
import teacherRoute from "./teacher.route.js"
import adminRoute from "./admin.route.js"
import enrollmentRoute from "./enrollment.route.js"
import notificationRoute from "./notification.route.js"
import ratingRoute from "./rating.route.js"
import progressRoute from "./progress.route.js"
import suggestionRoute from "./suggestion.route.js"
import webhookRoute from "./webhook.route.js"
import muxRoute from "./mux.route.js";

const route = (app) => {
    app.use('/api/auth', userRoute)
    app.use('/api/student', studentRoute)
    app.use('/api/teacher',teacherRoute)
    app.use('/api/admin', adminRoute)

    app.use('/api/course', courseRoute)
    app.use('/api/section', sectionRoute)
    app.use('/api/lesson', lessonRoute)

    app.use('/api/comment', commentRoute)
    app.use('/api/enrollment', enrollmentRoute)
    app.use('/api/notification', notificationRoute) 
    app.use('/api/rating', ratingRoute)
    app.use('/api/progress', progressRoute)
    app.use('/api/suggestion', suggestionRoute)

    app.use('/api/webhook', webhookRoute)
    app.use('/api/mux', muxRoute);
}

export default route