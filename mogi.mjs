import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { timeStamp } from 'console';
class mogi
{
    constructor(repoPath='.')
    {
        this.repoPath = path.join(repoPath,'.mogi');
        this.objectspath = path.join(this.repoPath,'objects'); //.mogi/objects( store repository objects )
        this.headPath = path.join(this.repoPath, 'HEAD'); //.mogi/HEAD( track the current branch or commit)
        //staging
        this.indexpath = path.join(this.repoPath , 'index'); //.mogi/index
    }
//initialize the mogi folder
    async init()
    {
        await fs.mkdir(this.objectspath, {recursive: true});
        try
        {    
            await fs.writeFile(this.headPath, '' , {flag: 'wx'}); //wx: write if not exist
            await fs.writeFile(this.indexpath, JSON.stringify([]), {flag: 'wx'});
        }catch(error)
        {
            console.log('already initialized .mogi folder');
        }
   }
   hashObject(content)
   {
        return crypto.createHash('sha1').update(content , 'utf-8').digest('hex');
   } 
   async add(filesToBeAdded)
   {
        const fileData = await fs.readFile(filesToBeAdded, {encoding:'utf-8'});
        const fileHash = this.hashObject(fileData);
        console.log(fileHash);
        const newFileObjectPath = path.join(this.objectspath, fileHash);
        await fs.writeFile(newFileObjectPath, fileData);
        await this.updateTheStagingArea(filesToBeAdded, fileHash);
        console.log('added  ${filesToBeAdded}');

    }

    async updateTheStagingArea(filePath, fileHash) {
        // Read the file content
        const fileContent = await fs.readFile(this.indexpath, { encoding: 'utf-8' });
    
        // Parse the content as JSON and ensure it is an array
        let index;
        try {
            index = JSON.parse(fileContent);
            if (!Array.isArray(index)) {
                index = []; // Default to an empty array if it's not an array
            }
        } catch (error) {
            index = []; // If parsing fails, initialize as an empty array
        }
    
        // Add the new file object to the index array
        index.push({ path: filePath, hash: fileHash });
    
        // Write the updated index back to the file
        await fs.writeFile(this.indexpath, JSON.stringify(index));
    }

    async commite(message)
    {
        const index = JSON.parse(await fs.readFile(this.indexpath, {encoding: 'utf-8'}));
        const parentCommit = await this.getHead();
        const commitData = 
        {
            timeStamp : new Date().toISOString(),message,files:index,parent:parentCommit
        };
        const commitHash = this.hashObject(JSON.stringify(commitData));
        const commitPath = path.join(this.objectspath, commitHash);
        await fs.writeFile(commitPath, JSON.stringify(commitData));
        await fs.writeFile(this.headPath, commitHash);//update the head to the new commit
        await fs.writeFile(this.indexpath, JSON.stringify([])); //clear the index
        console.log('commited');

    }
    async getHead()
    {
        try
        {
            return await fs.readFile(this.headPath, {encoding: 'utf-8'});
        }catch(error)
        {
            return null;
        }
    
    }
    async log()
    {
        let commitHash = await this.getHead();
        while(commitHash)
        {
            const commitData = JSON.parse(await fs.readFile(path.join(this.objectspath, commitHash), {encoding: 'utf-8'}));
            console.log(`^0^/~~~~~\n`);
            console.log(`commit: ${commitHash}\nDate: ${commitData.timeStamp}\n\n ${commitData.message}\n\n`);
            console.log('message:', commitData.message);
            commitHash = commitData.parent;
        }
    }

    async showCommiteDiff(commitHash)
    {
        const commitData = JSON.parse(await this.getCommitData(commitHash));
        if(!commitData)
        {
            console.log('commit not found');
            return;
        }
        console.log('changes in the last commit are: ');
        for(const file of commitData.files)
        {
            console.log(`File: ${file.path}`);
        }

        //CHECK POINT:)
    }
    async getCommitData(commitHash)
    {
        const commitPath = path.join(this.objectspath, commitHash);
        try{
            return await fs.readFile(commitPath, {encoding: 'utf-8'});
        }catch(error)
        {
            console.log('commit not found' , error);
            return null;
        }
    }
}
(async () =>
{
    const repo = new mogi();
    await repo.init();
    await repo.add('sample.txt');
    await repo.commite('second commit');
    await repo.log();
})();

