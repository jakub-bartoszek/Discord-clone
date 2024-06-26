"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import qs from "query-string";
import { cn } from "@/lib/utils";
import {
 Channel,
 ChannelType,
 Member,
 MemberRole,
 Profile,
 Server
} from "@prisma/client";
import { ModalType, useModal } from "@/hooks/use-modal-store";

import { Edit, Hash, Lock, Mic, Trash } from "lucide-react";
import { ActionTooltip } from "@/components/action-tooltip";
import { ServerMember } from "./server-member";

interface ServerChannelProps {
 channel: Channel;
 server: Server;
 role?: MemberRole;
 members?: Member[];
}

interface Participant {
 id: string;
 identity: string;
 member: Member & { profile: Profile };
 metadata: string;
}

const iconMap = {
 [ChannelType.TEXT]: Hash,
 [ChannelType.AUDIO]: Mic
};

export const ServerChannel = ({
 server,
 channel,
 role,
 members
}: ServerChannelProps) => {
 const params = useParams();
 const router = useRouter();

 const { onOpen } = useModal();
 const [participants, setParticipants] = useState<Participant[]>([]);

 useEffect(() => {
  const fetchParticipants = async () => {
   if (channel.type === ChannelType.AUDIO && members) {
    try {
     const url = qs.stringifyUrl({
      url: `/api/channels/${channel.id}/participants`,
      query: {
       channelId: channel.id
      }
     });

     const response = await axios.get(url);

     const participants = response.data.map((participant: any) => {
      const profileId = participant.metadata;

      return {
       member: members.find((member) => member.profileId === profileId)
      };
     });

     setParticipants(participants);
    } catch (error) {
     console.error("Failed to fetch participants:", error);
    }
   }
  };

  fetchParticipants();
 }, [channel, members]);

 const Icon = iconMap[channel.type];

 const onClick = () => {
  router.push(`/servers/${params?.serverId}/channels/${channel.id}`);
 };

 const onAction = (e: React.MouseEvent, action: ModalType) => {
  e.stopPropagation();
  onOpen(action, { channel, server });
 };

 return (
  <div>
   <button
    onClick={onClick}
    className={cn(
     "group p-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1",
     params?.channelId === channel.id && "bg-zinc-700/20 dark:bg-zinc-700"
    )}
   >
    <Icon className="flex-shrink-0 w-5 h-5 text-zinc-500 dark:text-zinc-400" />
    <p
     className={cn(
      "line-clamp-1 font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition",
      params?.channelId === channel.id &&
       "text-primary dark:text-zinc-200 dark:group-hover:text-white"
     )}
    >
     {channel.name}
    </p>
    {channel.name !== "general" && role !== MemberRole.GUEST && (
     <div className="ml-auto flex items-center gap-x-2">
      <ActionTooltip label="Edit">
       <Edit
        onClick={(e) => onAction(e, "editChannel")}
        className="hidden group-hover:block w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
       />
      </ActionTooltip>
      <ActionTooltip label="Delete">
       <Trash
        onClick={(e) => onAction(e, "deleteChannel")}
        className="hidden group-hover:block w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
       />
      </ActionTooltip>
     </div>
    )}
    {channel.name === "general" && (
     <Lock className="ml-auto w-4 h-4 text-zinc-500 dark:text-zinc-400" />
    )}
   </button>
   {channel.type === ChannelType.AUDIO &&
    participants.length > 0 &&
    participants.map((participant) => (
     <ServerMember
      key={participant.member.id}
      server={server}
      member={participant.member}
     />
    ))}
  </div>
 );
};
