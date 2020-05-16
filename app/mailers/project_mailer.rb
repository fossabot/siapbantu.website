class ProjectMailer < ApplicationMailer
  def new_volunteer
    @project = params[:project]
    @user = params[:user]
    @note = params[:note]
    @user_volunteered_projects_count = @user.volunteers.count

    mail(to: @project.user.email, reply_to: @user.email, subject: "Anda punya relawan baru untuk #{@project.name}!")
  end

  def volunteer_outreach
    @user = params[:user]
    mail(to: @user.email, reply_to: ENV['EMAIL_ADDRESS'], subject: '[Siapbantu - diperlukan tindakan] Terima kasih')
  end
end
