import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
class mogi
{
    constructor(repoPath='.')
    {
        this.repoPath = path.join(repoPath,'.mogi');
        this.objectspath = path.join(this.repoPath,'objects'); //.mogi/objects( store repository objects )
        this.headPath = path.join(this.repoPath, 'HEAD'); //.mogi/HEAD( track the current branch or commit)
        //staging
        this.indexpath = path.join(this.repoPath , 'index'); //.mogi/index
        this.init();
    }
//initialize the mogi folder
    async init()
    {
        await fs.mkdir(this.objectspath, {recursive: true});
        try
        {    
            await fs.writeFile(this.headPath, '' , {flag: 'wx'}); //wx: write if not exist
            await fs.writeFile(this.indexpath, '', JSON.stringify({}), {flag: 'wx'});
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
        //add the file to the staging area
        console.log('added  ${filesToBeAdded}');

    }

    async updateTheStagingArea(filePath,fileHash)
    {
        const index = JSON.parse(await fs.readFile(this.indexpath,{encoding: 'utf-8'}));
        index.push({path :filePath , hash:fileHash}); //add file to the index
    }
}