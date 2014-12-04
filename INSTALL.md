wevidhere INSTALL
=================

=======================================
Part I: Setting Up Your Local Computer
=======================================

1.	Create an account on GitHub, if you haven’t already
	- http://www.github.com

2.	Download and install git
	- http://git-scm.com/download

	Windows: 
		make sure you select "use git from Windows command prompt" 
		(the bottom of the three shell options, in red)
	Mac: 
		no special instructions

3.	Load the git command line console window

4.	Create a default directory for your new project. 
	- Create a sub-folder in your project directory
	- Put your current folder holding all your HTML, JS, CSS and other files into this folder. 
	- Name it "public"

5.	Add the following files and folders from the default repository

	package.json
	bower.json
	.gitignore
	.bowerrc
	/test

6.	Edit "repository" in "package.json" to reflect your git default project directory

7.	Edit "homepage" in "bower.json" to reflect your git default project home page

8.	Download and install NodeJS and npm, if you haven’t already
	- http://nodejs.org/download/

	Note that Node will install into your System area, e.g.
	Windows: 
		C:\Program Files (x86)\nodejs\
	Mac:
		Usr/local/bin/node

8.	Load the NodeJS command-line console window 

	Windows
		cd into C:\Users\xxxxx\Appdata\Roaming
		Create a new directory
		mkdir npm
 		(needed by npm, not created by installer)

		Note that the Windows version of Git and Node Command prompt will use Windows shell commands, instead of Unix 
		(e.g. "dir"instead of "ls" to list files)

	Mac: 
		No special configuration necessary

9. Setting up Your Git Repository
	- Basic git manipulation
		@link http://rogerdudler.github.io/git-guide/ 

		a. cd back into the directory you created for your project. 
		b. You should be inside a project folder, but OUTSIDE the ‘public’ folder with your website. 
		c. Test by typing ‘dir’ (Windows) or ‘ls’ (Mac) to confirm you see files including package.json.
		d. Create a new project on github.com, with the name ‘wevidhere-yourlastname’
		e. Return to your git command prompt, and cd into your project directory (one level above ‘public’ folder)
		f. Clone the git project via 
			
			git clone /path/to/repository
			
			(when using a remote server, your command will be)

			git clone https://github.com/username/path/to/repository
			
			(alternate)
			git remote add origin https://github.com/username/path/to/repository

		g. Add all your files

			git add *

		h. Push the changes to your git server

			git commit -m "My Commit message here"
			git push origin master
			
		   in some cases, you may have to use the following:
		   	git push origin HEAD:master

10. Setup Your Localhost
	a. In your terminal, cd to your default directory
	b. Run the npm installer (uses package.json)
		
		npm install

	c. Use "sudo" (super-user) commands to check tools directly (don’t use the ‘sudo’ on Windows)

		sudo npm install –g git
		sudo npm install -g bower

11.	Try starting your local server
	a. cd outside of public, but in your project directory
	b. run the following command (from scripts in package.json and bower.json)

		npm start

12. Test http://localhost:8000 to see if it is running. 
	- By default, the ‘http-server’ you installed should look inside a /public directory in your project for your site files