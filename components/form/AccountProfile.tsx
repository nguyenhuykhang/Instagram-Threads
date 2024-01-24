"use client"

import React, { ChangeEvent, useState } from 'react'
import * as z from 'zod'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod'
import { UserValidation } from '@/lib/validations/user';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { User } from '@clerk/nextjs/server';
import Image from 'next/image';
import { isBase64Image } from '@/lib/utils';
import { useUploadThing } from '@/lib/uploadthing'
import { updateUser } from '@/lib/actions/user.action';
import { usePathname, useRouter } from "next/navigation";
import profileSvg from '@/public/assets/profile.svg'
interface Props {
    user: {
      id: string;
      objectId: string;
      username: string;
      name: string;
      bio: string;
      image: string;
    };
    btnTitle: string;
  }
  const AccountProfile = ({ user, btnTitle }: Props) => {
    const router = useRouter();
    const pathname = usePathname();
    const { startUpload } = useUploadThing("media");
  
    const [files, setFiles] = useState<File[]>([]);
  
    const form = useForm<z.infer<typeof UserValidation>>({
      resolver: zodResolver(UserValidation),
      defaultValues: {
        profile_photo: user?.image ? user.image : "",
        name: user?.name ? user.name : "",
        username: user?.username ? user.username : "",
        bio: user?.bio ? user.bio : "",
      },
    });
    const handleImage = (
      e: ChangeEvent<HTMLInputElement>,
      fieldChange: (value: string) => void
    ) => {
      e.preventDefault();
  
      const fileReader = new FileReader();
  
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        setFiles(Array.from(e.target.files));
  
        if (!file.type.includes("image")) return;
  
        fileReader.onload = async (event) => {
          const imageDataUrl = event.target?.result?.toString() || "";
          fieldChange(imageDataUrl);
        };
  
        fileReader.readAsDataURL(file);
      }
    };

   const onSubmit = async (values: z.infer<typeof UserValidation>) => {
    const blob = values.profile_photo;

    const hasImageChanged = isBase64Image(blob);
    if (hasImageChanged) {
      const imgRes = await startUpload(files);

      if (imgRes && imgRes[0].imgUrl) {
        // values.profile_photo = imgRes[0].url;
        values.profile_photo = 'randomFirst';
      }
    }
    values.profile_photo = 'randomFirst';
    // TODO: update user profile
    await updateUser({
      name: values.name,
      path: pathname,
      username: values.username,
      userId: user.id,
      bio: values.bio,
      image: 'randomFirst.jpg',
    });

    if (pathname === "/profile/edit") {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <FormField
        control={form.control}
        name="profile_photo"
        render={({ field }) => (
          <FormItem className='flex items-center gap-3 w-full'>
            <FormLabel className='account-form_image_label'>
              {field.value ? (
                <Image src={field.value} alt="profile photo" width={96} height={96} priority className='rounded-full object-contain'/>
              ) : (
                <Image src={profileSvg} alt="profile photo" width={24} height={24} className='object-contain'/>
              )}
              </FormLabel>

            <FormControl className='flex-1 text-base-semibold text-gray-200'>
              <Input
              type='file'
              accept='image/*'
               placeholder="Upload a photo"
               className='account-form_image-input'
               onChange={(e) => handleImage(e, field.onChange)}
                />
            </FormControl>
            <FormDescription>
              This is your public display name.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className='flex flex-col gap-3 w-full'>
                  <FormLabel className='text-base-semibold text-light-2'>
                    Name
                  </FormLabel>

                  <FormControl >
                    <Input
                    type='text'
                  
                    className='account-form_input no focus'
                    {...field}
                      />
                  </FormControl>
                  <FormDescription>
                    This is your public display name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

      <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className='flex flex-col gap-3 w-full'>
                  <FormLabel className='text-base-semibold text-light-2'>
                    Username
                  </FormLabel>

                  <FormControl >
                    <Input
                    type='text'
                    className='account-form_input no focus'
                    {...field}
                      />
                  </FormControl>
                  <FormDescription>
                    This is your public display name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

      <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
            <FormItem className='flex flex-col gap-3 w-full'>
                  <FormLabel className='text-base-semibold text-light-2'>
                    Bio
                  </FormLabel>

                  <FormControl >
                    
                    <Textarea
                    rows={10}
                    placeholder="Upload a photo"
                    className='account-form_input no focus'
                    {...field}
                      />
                  </FormControl>
                  <FormDescription>
                    This is your public display name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
      <Button type="submit" className='bg-primary-500'>Submit</Button>
    </form>
  </Form>
  )
}

export default AccountProfile;
